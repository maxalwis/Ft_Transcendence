import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Body,
  UnauthorizedException,
  Get,
  UseFilters,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { FortyTwoAuthGuard } from './guards/fortytwo-oauth.guard';
import { Throttle } from '@nestjs/throttler';
import { AUTH_THROTTLE } from '../throttler/http-throttler.guard';
import { OAuthExceptionFilter, OAUTH_CALLBACK_URL } from './filters/oauth-exception.filter';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { User } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { CreateLocalUserDto } from '../users/dto/create-user.dto';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private realtimeEmitter: RealtimeEmitterService
  ) {}

  @Post('register')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: CreateLocalUserDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.usersService.createLocal(body);
    const { accessToken, refreshToken } = await this.authService.login(user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      accessToken,
      user: this.usersService.toPublicUser(user),
    };
  }

  @Throttle(AUTH_THROTTLE)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
      path: '/',
    });

    return {
      accessToken,
      user: req.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return { authenticated: false };
    }

    try {
      const data = await this.authService.refreshAccessToken(refreshToken);
      return { authenticated: true, ...data };
    } catch {
      // Returning a clean false for an expired or invalid refresh token.
      return { authenticated: false };
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      const userId = await this.authService.getUserIdFromRefreshToken(refreshToken);
      await this.authService.revokeRefreshToken(refreshToken);
      if (userId) {
        this.realtimeEmitter.disconnectUser(userId);
      }
    }

    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  // --- OAuth Google ---
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Ne fait rien : le guard intercepte et redirige vers Google
  }

  @Get('google/callback')
  @UseFilters(OAuthExceptionFilter)
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const { refreshToken } = await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.redirect(OAUTH_CALLBACK_URL);
  }

  // --- OAuth 42 ---
  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoAuth() {
    // Ne fait rien : le guard intercepte et redirige vers 42
  }

  @Get('42/callback')
  @UseFilters(OAuthExceptionFilter)
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const { refreshToken } = await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.redirect(OAUTH_CALLBACK_URL);
  }
}

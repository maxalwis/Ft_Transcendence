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
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { FortyTwoAuthGuard } from './guards/fortytwo-oauth.guard';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { UsersService } from '../users/users.service';
import { CreateLocalUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: CreateLocalUserDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.usersService.createLocal(body);
    const { accessToken, refreshToken } = await this.authService.login(user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    return {
      accessToken,
      user: { id: user.id, email: user.email, username: user.username, provider: user.provider },
    };
  }

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
      path: '/api/auth/refresh',
    });

    return {
      accessToken,
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        provider: req.user.provider,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    // invalider le refresh token en DB si stocké (voir login() dans auth.service)
    return { message: 'Déconnecté' };
  }

  // --- OAuth Google ---
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Ne fait rien : le guard intercepte et redirige vers Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const { refreshToken } = await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.redirect('https://localhost:8443/oauth/callback');
  }

  // --- OAuth 42 ---
  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoAuth() {
    // Ne fait rien : le guard intercepte et redirige vers 42
  }

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const { refreshToken } = await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.redirect('https://localhost:8443/oauth/callback');
  }
}

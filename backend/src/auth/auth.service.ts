import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findFromEmailOrNull(email);
    if (!user || !user.password) {
      //inexistant ou OAuth
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password, ...result } = user;
    return result; // result contient tout user sauf password
  }

  async validateOAuthUser(profile: {
    email: string;
    username: string;
    provider: string;
    providerId: string;
  }) {
    let user = await this.usersService.findFromEmailOrNull(profile.email);

    if (!user) {
      user = await this.usersService.createOAuth(profile);
    }

    return user;
  }

  async login(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // METTRE LE REFRESH TOKEN DANS LA DB?

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      const newAccessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        { expiresIn: '15m' }
      );

      return {
        accessToken: newAccessToken,
        user: { id: user.id, email: user.email, username: user.username },
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }
}

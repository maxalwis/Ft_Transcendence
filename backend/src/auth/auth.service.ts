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

    return this.usersService.toPublicUser(user);
  }

  async validateOAuthUser(profile: {
    email: string;
    username: string;
    provider: string;
    providerId: string;
    avatar: string;
  }) {
    let user = await this.usersService.findFromEmailOrNull(profile.email);

    if (!user) {
      user = await this.usersService.createOAuth(profile);
    } else if (profile.avatar && user.avatar !== profile.avatar) {
      user = await this.usersService.update(user.id, { avatar: profile.avatar });
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
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        { expiresIn: '15m' }
      );

      return {
        accessToken: newAccessToken,
        user: this.usersService.toPublicUser(user),
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }

  async verifyAccessToken(token: string): Promise<{ id: number; email: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      return { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

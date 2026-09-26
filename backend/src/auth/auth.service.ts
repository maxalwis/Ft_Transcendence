import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { User } from '../generated/prisma/client';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  // Le JWT lui-même n'est jamais stocké : seul son hash sert de clé de
  // recherche/révocation en base, pour ne pas garder un secret exploitable
  // en clair côté serveur si la table fuit.
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

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
    let user = await this.usersService.findFromProviderOrNull(
      profile.provider,
      profile.providerId
    );

    if (!user) {
      // Les emails des comptes locaux ne sont pas vérifiés : n'importe qui peut
      // s'inscrire avec l'adresse d'un autre. On ne rattache donc jamais un
      // compte existant par email, sinon la victime qui se connecte en OAuth
      // atterrirait dans le compte créé par l'attaquant.
      if (await this.usersService.findFromEmailOrNull(profile.email)) {
        throw new ConflictException(
          'An account already exists with this email. Log in with your password instead.'
        );
      }
      return this.usersService.createOAuth(profile);
    }

    if (profile.avatar && user.avatar !== profile.avatar) {
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

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const stored = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: this.hashToken(refreshToken) },
      });
      if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token revoked or expired');
      }

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

  // Utilisé au logout : on a seulement le cookie refresh_token sous la main
  // (le front n'envoie pas l'access token sur cet appel), donc on le décode
  // pour retrouver l'utilisateur à déconnecter des sockets temps réel.
  async getUserIdFromRefreshToken(refreshToken: string): Promise<number | null> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
      return payload.sub;
    } catch {
      return null;
    }
  }

  // Marque le token comme révoqué en base : la signature JWT reste valide
  // jusqu'à son expiration naturelle, mais refreshAccessToken() le rejettera
  // désormais via la vérification `stored.revoked`.
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken) },
      data: { revoked: true },
    });
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

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_to_prevent_crash',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { emails, displayName, id } = profile;
    const user = await this.authService.validateOAuthUser({
      email: emails[0].value,
      username: displayName,
      provider: 'google',
      providerId: id,
    });
    done(null, user);
  }
}
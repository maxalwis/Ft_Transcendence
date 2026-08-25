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
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'), // ex: https://localhost:8443/api/auth/google/callback
      scope: ['email', 'profile'],
    });
  }

  async validate(
	accessToken: string,
	refreshToken: string,
	profile: any,
	done: VerifyCallback
) {
    const { emails, displayName, id } = profile;
    const user = await this.authService.validateOAuthUser()
	{
      email: emails[0].value,
      username: displayName,
      provider: 'google',
      providerId: id,
    };
    done(null, user);
  }
}

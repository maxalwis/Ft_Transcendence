import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import axios from 'axios';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    config: ConfigService,
    private authService: AuthService
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID || config.get<string>('FORTYTWO_CLIENT_ID') || 'dummy_42_id',
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET || config.get<string>('FORTYTWO_CLIENT_SECRET') || 'dummy_42_secret',
      callbackURL: process.env.FORTYTWO_CALLBACK_URL || config.get<string>('FORTYTWO_CALLBACK_URL') || 'http://localhost:3000/auth/42/callback',
    });
  }

  async validate(accessToken: string) {
    const { data } = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = await this.authService.validateOAuthUser({
      email: data.email,
      username: data.login,
      provider: '42',
      providerId: String(data.id),
    });

    return user;
  }
}
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
      clientID: config.getOrThrow<string>('FORTYTWO_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('FORTYTWO_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('FORTYTWO_CALLBACK_URL'),
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
      avatar: data.image?.link ?? '',
    });

    return user;
  }
}

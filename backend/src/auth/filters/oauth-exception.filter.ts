import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { FRONTEND_URL, isAllowedOrigin } from '../../cors.config';

// Le provider OAuth ramène le navigateur sur l'hôte par lequel le login a été
// initié (localhost, une IP LAN pour un testeur, ...) : on redirige donc vers
// cette même origine plutôt que vers une URL fixe, sinon un testeur sur une
// autre machine du wifi finirait renvoyé vers son propre "localhost".
// On ne fait confiance qu'aux origines déjà validées pour le CORS (voir
// cors.config.ts) ; sinon on retombe sur FRONTEND_URL.
export function oauthCallbackUrl(req: Request): string {
  const origin = `${req.protocol}://${req.get('host') ?? ''}`;
  const base = isAllowedOrigin(origin) ? origin : FRONTEND_URL;
  return `${base}/oauth/callback`;
}

// Les callbacks OAuth sont ouverts par le navigateur (redirection du provider),
// pas par un fetch du front : une erreur JSON s'afficherait telle quelle.
// On renvoie donc vers le front avec un code d'erreur qu'il sait traduire.
@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();

    // Erreurs passport (code déjà utilisé, provider injoignable...) : on garde une trace
    if (!(exception instanceof HttpException)) {
      this.logger.error('OAuth callback failed', exception as Error);
    }

    const error = exception instanceof ConflictException ? 'account_exists' : 'oauth_failed';
    res.redirect(`${oauthCallbackUrl(req)}?error=${error}`);
  }
}

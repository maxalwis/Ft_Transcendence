import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

export const OAUTH_CALLBACK_URL = 'https://localhost:8443/oauth/callback';

// Les callbacks OAuth sont ouverts par le navigateur (redirection du provider),
// pas par un fetch du front : une erreur JSON s'afficherait telle quelle.
// On renvoie donc vers le front avec un code d'erreur qu'il sait traduire.
@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    // Erreurs passport (code déjà utilisé, provider injoignable...) : on garde une trace
    if (!(exception instanceof HttpException)) {
      this.logger.error('OAuth callback failed', exception as Error);
    }

    const error = exception instanceof ConflictException ? 'account_exists' : 'oauth_failed';
    res.redirect(`${OAUTH_CALLBACK_URL}?error=${error}`);
  }
}

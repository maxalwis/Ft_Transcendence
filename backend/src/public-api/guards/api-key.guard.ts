import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * Protects the public API: requires a valid `X-API-Key` header matching
 * PUBLIC_API_KEY from the environment. This is separate from the app's
 * user session auth: the public API is keyed, not user-scoped.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-api-key');
    const expected = process.env.PUBLIC_API_KEY;

    if (!expected) {
      throw new UnauthorizedException('Public API key is not configured');
    }
    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}

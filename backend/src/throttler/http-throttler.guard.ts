import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Stricter budget for endpoints that check a password (brute-force targets).
// Keyed per IP and per route: 5 attempts per minute on each.
export const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

/**
 * Global rate limiter (registered as APP_GUARD), keyed by client IP.
 * APP_GUARD also runs on the WebSocket gateway, where there is no HTTP
 * request/response for ThrottlerGuard to read, so only HTTP is metered.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    return context.getType() !== 'http';
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * One shared rate-limit bucket for the whole public API, metered per API key.
 * - getTracker keys the counter by the X-API-Key header (not the proxy IP).
 * - generateKey drops the per-handler part, so all 5 endpoints share one budget.
 */
@Injectable()
export class PublicApiThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const key = req.headers?.['x-api-key'];
    const tracker = Array.isArray(key) ? key[0] : key;
    return Promise.resolve(tracker ?? req.ip ?? 'anonymous');
  }

  protected generateKey(_context: ExecutionContext, suffix: string, name: string): string {
    // no handler in the key => same bucket for every public endpoint
    return `public-api:${name}:${suffix}`;
  }
}

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  const guard = new ApiKeyGuard();
  const originalKey = process.env.PUBLIC_API_KEY;

  const contextWithKey = (key?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ header: (name: string) => (name === 'x-api-key' ? key : undefined) }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    process.env.PUBLIC_API_KEY = 'expected-key';
  });

  afterAll(() => {
    process.env.PUBLIC_API_KEY = originalKey;
  });

  it('should accept the configured key', () => {
    expect(guard.canActivate(contextWithKey('expected-key'))).toBe(true);
  });

  it('should reject a missing key', () => {
    expect(() => guard.canActivate(contextWithKey(undefined))).toThrow(UnauthorizedException);
  });

  it('should reject a wrong key, including one of a different length', () => {
    expect(() => guard.canActivate(contextWithKey('expected-kez'))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(contextWithKey('short'))).toThrow(UnauthorizedException);
  });

  it('should refuse everything when no key is configured', () => {
    delete process.env.PUBLIC_API_KEY;
    expect(() => guard.canActivate(contextWithKey(''))).toThrow(UnauthorizedException);
  });
});

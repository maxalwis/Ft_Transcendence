import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator implements OnApplicationShutdown {
  private redis: Redis;

  constructor() {
    super();

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.ping();
      const isUp = pong === 'PONG';
      const result = this.getStatus(key, isUp);

      if (isUp) {
        return result;
      }
      throw new HealthCheckError('Redis ping failed', result);
    } catch (error) {
      // Cast de "error" en type Error pour accéder à .message sans avertissement TypeScript
      const err = error as Error;

      throw new HealthCheckError(
        'Redis connection failed',
        this.getStatus(key, false, { message: err.message }),
      );
    }
  }

  onApplicationShutdown() {
    this.redis.disconnect();
  }
}
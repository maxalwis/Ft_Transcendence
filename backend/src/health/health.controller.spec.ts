import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule, HealthCheckService } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from '../prisma/prisma.health';
import { RedisHealthIndicator } from '../prisma/redis.health';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        PrismaHealthIndicator,
        {
          provide: PrismaHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: RedisHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

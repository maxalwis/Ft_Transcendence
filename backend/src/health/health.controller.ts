import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

// Permet de voir dans /health que tout tourne
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private healthIndicatorService: HealthIndicatorService
  ) {}

  @Get()
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.checkDatabase(),
      // par la suite : () => this.checkRedis(), () => this.checkNginx(), etc.
    ]);
  }

  // Vérifie que la connexion à BDD Postgres fonctionne avec une query minimale
  private async checkDatabase() {
    const indicator = this.healthIndicatorService.check('database');

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (e) {
      return indicator.down();
    }
  }
}

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerMiddleware } from '../logger.middleware';
import { PrismaHealthIndicator } from '../prisma/prisma.health';
@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator], // <-- Ajouté ici
})
export class HealthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
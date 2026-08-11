import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [HealthModule, PrismaModule, IngestionModule, EventsModule, UsersModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

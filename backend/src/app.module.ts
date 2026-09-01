import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { LoggerMiddleware } from './logger.middleware';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { TranslationsModule } from './translations/translations.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HealthModule,
    PrismaModule,
    IngestionModule,
    EventsModule,
    UsersModule,
    MessagesModule,
    AuthModule,
    FriendsModule,
    TranslationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

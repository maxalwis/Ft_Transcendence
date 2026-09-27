import { GdprModule } from './gdpr/gdpr.module';
import { MailModule } from './mail/mail.module';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { LoggerMiddleware } from './logger.middleware';
import { HttpThrottlerGuard } from './throttler/http-throttler.guard';
import { AuthModule } from './auth/auth.module';
import { PublicApiModule } from './public-api/public-api.module';
import { FriendsModule } from './friends/friends.module';
import { EventsInterestsModule } from './events-interest/events-interest.module';
import { RealtimeModule } from './realtime/realtime.module';
import { TranslationsModule } from './translations/translations.module';
import { TilesModule } from './tiles/tiles.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 500 }]),
    HealthModule,
    PrismaModule,
    IngestionModule,
    EventsModule,
    UsersModule,
    MessagesModule,
    AuthModule,
    FriendsModule,
    EventsInterestsModule,
    RealtimeModule,
    TranslationsModule,
    PublicApiModule,
    MailModule,
    GdprModule,
    TilesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: HttpThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}

import { Module } from '@nestjs/common';
import { EventsInterestsController } from './events-interest.controller';
import { EventsInterestsService } from './events-interest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsModule } from '../friends/friends.module';
import { RealtimeEmitterModule } from '../realtime/realtime-emitter.module';

@Module({
  imports: [PrismaModule, FriendsModule, RealtimeEmitterModule],
  controllers: [EventsInterestsController],
  providers: [EventsInterestsService],
  exports: [EventsInterestsService],
})
export class EventsInterestsModule {}

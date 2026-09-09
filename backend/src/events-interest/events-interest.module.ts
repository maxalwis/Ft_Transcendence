import { Module } from '@nestjs/common';
import { EventsInterestsController } from './events-interest.controller';
import { EventsInterestsService } from './events-interest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [PrismaModule, FriendsModule],
  controllers: [EventsInterestsController],
  providers: [EventsInterestsService],
  exports: [EventsInterestsService],
})
export class EventsInterestsModule {}

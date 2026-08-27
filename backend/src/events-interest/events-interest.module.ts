import { Module } from '@nestjs/common';
import { EventsInterestController } from './events-interest.controller';
import { EventsInterestService } from './events-interest.service';

@Module({
  controllers: [EventsInterestController],
  providers: [EventsInterestService]
})
export class EventsInterestModule {}

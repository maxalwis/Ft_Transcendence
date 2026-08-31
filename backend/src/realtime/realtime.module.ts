import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { SessionTrackerService } from './session-tracker.service';
import { RealtimeEmitterService } from './realtime-emitter.service';

@Module({
  providers: [RealtimeGateway, SessionTrackerService, RealtimeEmitterService],
})
export class RealtimeModule {}

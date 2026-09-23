import { Module } from '@nestjs/common';
import { RealtimeEmitterService } from './realtime-emitter.service';
import { SessionTrackerService } from './session-tracker.service';

@Module({
  providers: [RealtimeEmitterService, SessionTrackerService],
  exports: [RealtimeEmitterService, SessionTrackerService],
})
export class RealtimeEmitterModule {}

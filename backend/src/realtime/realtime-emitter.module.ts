import { Module } from '@nestjs/common';
import { RealtimeEmitterService } from './realtime-emitter.service';

@Module({
  providers: [RealtimeEmitterService],
  exports: [RealtimeEmitterService],
})
export class RealtimeEmitterModule {}

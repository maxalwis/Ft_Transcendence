import { forwardRef, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { SessionTrackerService } from './session-tracker.service';
import { RealtimeEmitterService } from './realtime-emitter.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { RealtimeEmitterModule } from './realtime-emitter.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [AuthModule, UsersModule, MessagesModule, RealtimeEmitterModule, EventsModule],
  providers: [RealtimeGateway, SessionTrackerService],
  exports: [RealtimeEmitterModule],
})
export class RealtimeModule {}

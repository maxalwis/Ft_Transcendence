import { forwardRef, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { SessionTrackerService } from './session-tracker.service';
import { RealtimeEmitterService } from './realtime-emitter.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { RealtimeEmitterModule } from './realtime-emitter.module';

@Module({
  imports: [AuthModule, UsersModule, MessagesModule, RealtimeEmitterModule],
  providers: [RealtimeGateway, SessionTrackerService, WsJwtGuard],
  exports: [RealtimeEmitterModule],
})
export class RealtimeModule {}

import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { RealtimeEmitterModule } from './realtime-emitter.module';

@Module({
  imports: [AuthModule, UsersModule, MessagesModule, RealtimeEmitterModule],
  providers: [RealtimeGateway],
  exports: [RealtimeEmitterModule],
})
export class RealtimeModule {}

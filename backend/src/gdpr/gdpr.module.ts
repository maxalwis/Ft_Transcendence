import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeEmitterModule } from '../realtime/realtime-emitter.module';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  imports: [
    PrismaModule,
    RealtimeEmitterModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}

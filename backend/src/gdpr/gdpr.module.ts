import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  imports: [PrismaModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}

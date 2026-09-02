import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicEventsController } from './public-events.controller';
import { PublicEventsService } from './public-events.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicEventsController],
  providers: [PublicEventsService],
})
export class PublicApiModule {}

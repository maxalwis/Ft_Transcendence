import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IngestionService],
})
export class IngestionModule {}

import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // <-- C'est CET import qui manque !
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}

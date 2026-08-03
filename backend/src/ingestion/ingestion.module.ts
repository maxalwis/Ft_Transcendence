import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';

@Module({
  providers: [IngestionService],
  controllers: [IngestionController]
})
export class IngestionModule {}

import { Controller, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Post('mairie-paris')
  trigger() {
    return this.ingestionService.fetchFromMairieParis();
  }
}

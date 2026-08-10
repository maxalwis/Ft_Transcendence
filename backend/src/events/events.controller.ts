import { Controller } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Vos routes API ici (ex: @Get(), @Post(), etc.)
}
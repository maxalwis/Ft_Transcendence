import { Controller, Query, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { MapQueryDto } from './dto/map-query.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('map')
  findForMap(@Query() query: MapQueryDto) {
    return this.eventsService.findForMap(query.bbox);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}

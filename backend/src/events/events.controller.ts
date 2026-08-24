import { Controller, Query, Get, Param, Logger } from '@nestjs/common';
import { EventsService } from './events.service';
import { MapQueryDto, NearbyQueryDto } from './dto/map-query.dto';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(private readonly eventsService: EventsService) {}

  @Get('map')
  findForMap(@Query() query: MapQueryDto) {
    if (query.bbox) {
      return this.eventsService.findForMap(query.bbox, query.from, query.to);
    }

    return this.eventsService.findAllForMap(query.from, query.to);
  }

  @Get('nearby')
  findNearby(@Query() query: NearbyQueryDto) {
    return this.eventsService.findNearby(query, query.from, query.to);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from './guards/api-key.guard';
import { PublicEventsService } from './public-events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';

// Public path is /v1/events; behind nginx it is reached as /api/v1/events.
@ApiTags('Public Events API')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard, ThrottlerGuard)
@Controller('v1/events')
export class PublicEventsController {
  constructor(private readonly events: PublicEventsService) {}

  @Get()
  findAll(@Query() query: QueryEventsDto) {
    return this.events.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.events.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.events.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }
}

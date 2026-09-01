import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('events/:eventId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Param('eventId') id: string, @Body() createMessageDto: CreateMessageDto) {
    createMessageDto.eventId = id;
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findByEvent(@Param('eventId') id: string) {
    return this.messagesService.findByEvent(id);
  }
}
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('events')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':id/messages')
  create(@Param('id') id: string, @Body() createMessageDto: CreateMessageDto) {
    createMessageDto.eventId = id;
    return this.messagesService.create(createMessageDto);
  }

  @Get(':id/messages')
  findByEvent(@Param('id') id: string) {
    return this.messagesService.findByEvent(id);
  }
}
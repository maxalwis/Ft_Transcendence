import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { CHAT_THROTTLE } from '../throttler/http-throttler.guard';

@Controller('events/:eventId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Throttle(CHAT_THROTTLE)
  create(@Param('eventId') eventId: string, @Body() dto: CreateMessageDto, @Req() req: Request) {
    return this.messagesService.create(req.user!.id, { ...dto, eventId });
  }

  @Get()
  findByEvent(@Param('eventId') id: string) {
    return this.messagesService.findByEvent(id);
  }
}

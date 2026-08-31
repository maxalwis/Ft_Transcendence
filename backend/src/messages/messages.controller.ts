import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('events')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  create(@Param('id') id: string, @Body() dto: CreateMessageDto, @Req() req: Request) {
    return this.messagesService.create(req.user!.id, { ...dto, eventId: id });
  }

  @Get(':id/messages')
  findByEvent(@Param('id') id: string) {
    return this.messagesService.findByEvent(id);
  }
}

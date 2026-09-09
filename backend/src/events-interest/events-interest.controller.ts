import { Controller, Post, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { EventsInterestsService } from './events-interest.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

interface AuthenticatedRequest extends Request {
  user: Express.User;
}

@Controller('events/:eventId/interest')
export class EventsInterestsController {
  constructor(private readonly interestsService: EventsInterestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  markInterested(@Param('eventId') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.interestsService.markInterested(req.user.id, eventId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  removeInterest(@Param('eventId') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.interestsService.removeInterest(req.user.id, eventId);
  }

  @Get('count')
  getCount(@Param('eventId') eventId: string) {
    return this.interestsService.getInterestCount(eventId);
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  getFriendsInterested(@Param('eventId') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.interestsService.getFriendsInterested(req.user.id, eventId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@Param('eventId') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.interestsService.getStatus(req.user.id, eventId);
  }
}

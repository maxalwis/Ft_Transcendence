import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import type { Request } from 'express';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('pending')
  getPendingRequests(@Req() req: Request) {
    return this.friendsService.getPendingRequests(req.user!.id);
  }

  @Post('request/:receiverId')
  sendRequest(@Req() req: Request, @Param('receiverId', ParseIntPipe) receiverId: number) {
    return this.friendsService.sendFriendRequest(req.user!.id, receiverId);
  }

  @Patch('accept/:senderId')
  acceptRequest(@Req() req: Request, @Param('senderId', ParseIntPipe) senderId: number) {
    return this.friendsService.acceptFriendRequest(senderId, req.user!.id);
  }

  @Patch('reject/:senderId')
  rejectRequest(@Req() req: Request, @Param('senderId', ParseIntPipe) senderId: number) {
    return this.friendsService.rejectFriendRequest(senderId, req.user!.id);
  }

  @Get()
  getFriends(@Req() req: Request) {
    return this.friendsService.getUserFriends(req.user!.id);
  }

  @Delete(':friendId')
  removeFriend(@Req() req: Request, @Param('friendId', ParseIntPipe) friendId: number) {
    return this.friendsService.removeFriend(req.user!.id, friendId);
  }
}

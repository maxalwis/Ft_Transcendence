import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  private getUserIdFromReq(req: any): number {
    return (
      req.user?.id ??
      (() => {
        throw new UnauthorizedException();
      })()
    );
  }

  @Get('pending')
  getPendingRequests(@Req() req: any) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.getPendingRequests(currentUserId);
  }

  @Post('request/:receiverId')
  sendRequest(@Req() req: any, @Param('receiverId', ParseIntPipe) receiverId: number) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.sendFriendRequest(currentUserId, receiverId);
  }

  @Patch('accept/:senderId')
  acceptRequest(@Req() req: any, @Param('senderId', ParseIntPipe) senderId: number) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.acceptFriendRequest(senderId, currentUserId);
  }

  @Patch('reject/:senderId')
  rejectRequest(@Req() req: any, @Param('senderId', ParseIntPipe) senderId: number) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.rejectFriendRequest(senderId, currentUserId);
  }

  @Get()
  getFriends(@Req() req: any) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.getUserFriends(currentUserId);
  }

  @Delete(':friendId')
  removeFriend(@Req() req: any, @Param('friendId', ParseIntPipe) friendId: number) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.removeFriend(currentUserId, friendId);
  }
}

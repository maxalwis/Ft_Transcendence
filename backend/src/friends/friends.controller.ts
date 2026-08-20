import { Controller, Get, Post, Patch, Param, ParseIntPipe, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  private getUserIdFromReq(req: any): number {
    return req.user?.id || 1;
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
    // Si c'est Bob qui accepte via curl/frontend pour les tests, on garde l'ID 2 par défaut ici
    const currentUserId = req.user?.id || 2;
    return this.friendsService.acceptFriendRequest(senderId, currentUserId);
  }

  @Get()
  getFriends(@Req() req: any) {
    const currentUserId = this.getUserIdFromReq(req);
    return this.friendsService.getUserFriends(currentUserId);
  }
}

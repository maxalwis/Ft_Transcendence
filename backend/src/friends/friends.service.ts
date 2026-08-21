import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('Vous ne pouvez pas vous ajouter vous-même.');
    }

    try {
      return await this.prisma.friendship.create({
        data: {
          senderId,
          receiverId,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Une demande a déjà été envoyée à cet utilisateur.');
      }
      throw error;
    }
  }

  async acceptFriendRequest(senderId: number, receiverId: number) {
    return this.prisma.friendship.update({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
      data: { status: 'ACCEPTED' },
    });
  }

  async getUserFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, status: true } },
        receiver: { select: { id: true, name: true, avatar: true, status: true } },
      },
    });

    return friendships.map((f) => (f.senderId === userId ? f.receiver : f.sender));
  }

  async getPendingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            status: true,
          },
        },
      },
    });
  }
}

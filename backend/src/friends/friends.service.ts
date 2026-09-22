import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';
import { PrismaService } from '../prisma/prisma.service';
import { SAFE_USER_SELECT } from '../users/safe-user-select';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private emitter: RealtimeEmitterService
  ) {}

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    // 1. Vérifier que le destinataire existe
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    // 2. Vérifier si une demande ou amitié existe déjà
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('A friend request or friendship already exists');
    }

    // 3. Créer la demande en attente
    try {
      const friendship = await this.prisma.friendship.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
        },
      });

      this.emitter.emitToUser(senderId, 'friend:request:new', {
        receiverId,
      });
      this.emitter.emitToUser(receiverId, 'friend:request:new', {
        senderId,
      });

      return friendship;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Une demande ou une amitié existe déjà.');
      }

      throw error;
    }
  }

  async acceptFriendRequest(senderId: number, receiverId: number) {
    const pendingRequest = await this.prisma.friendship.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        status: 'PENDING',
      },
    });

    if (!pendingRequest) {
      throw new NotFoundException('No pending friend request was found');
    }

    const friendship = await this.prisma.friendship.update({
      where: { id: pendingRequest.id },
      data: { status: 'ACCEPTED' },
    });

    this.emitter.emitToUser(senderId, 'friend:updated', {
      friendId: receiverId,
      action: 'accepted',
    });

    this.emitter.emitToUser(receiverId, 'friend:updated', {
      friendId: senderId,
      action: 'accepted',
    });

    return friendship;
  }

  async rejectFriendRequest(senderId: number, receiverId: number) {
    const pendingRequest = await this.prisma.friendship.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    if (!pendingRequest) {
      throw new NotFoundException('No pending friend request was found');
    }

    return this.prisma.friendship.delete({
      where: { id: pendingRequest.id },
    });
  }

  async getPendingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: { select: SAFE_USER_SELECT },
      },
    });
  }

  async getUserFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      include: { sender: { select: SAFE_USER_SELECT }, receiver: { select: SAFE_USER_SELECT } },
    });

    // On extrait le "vrai" ami : celui des deux qui n'est pas l'utilisateur courant
    return friendships.map((f) => (f.senderId === userId ? f.receiver : f.sender));
  }

  async removeFriend(userId: number, friendId: number) {
    const result = await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        status: 'ACCEPTED',
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('This friendship does not exist');
    }

    this.emitter.emitToUser(userId, 'friend:updated', {
      friendId,
      action: 'removed',
    });

    this.emitter.emitToUser(friendId, 'friend:updated', {
      friendId: userId,
      action: 'removed',
    });

    return { success: true };
  }

  // utilisé pour events-interest, plus léger que getUserFriends (renvoie seulement des id)
  async getFriendIds(userId: number): Promise<number[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      select: { senderId: true, receiverId: true },
    });

    return friendships.map((f) => (f.senderId === userId ? f.receiverId : f.senderId));
  }
}

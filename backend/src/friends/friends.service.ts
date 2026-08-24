import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('Vous ne pouvez pas vous ajouter vous-même.');
    }

    // 1. Vérifier que le destinataire existe
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Utilisateur introuvable.');
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
      throw new ConflictException('Une demande ou une amitié existe déjà.');
    }

    // 3. Créer la demande en attente
    return this.prisma.friendship.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        status: 'PENDING',
      },
    });
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
      throw new NotFoundException('Aucune demande d’ami en attente trouvée.');
    }

    return this.prisma.friendship.update({
      where: { id: pendingRequest.id },
      data: { status: 'ACCEPTED' },
    });
  }

  async getPendingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: true,
      },
    });
  }

  async getUserFriends(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }
}
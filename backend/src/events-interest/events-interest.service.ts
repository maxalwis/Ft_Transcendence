import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';
import { Prisma } from '../generated/prisma/client';
import { SAFE_USER_SELECT } from '../users/safe-user-select';

@Injectable()
export class EventsInterestsService {
  constructor(
    private prisma: PrismaService,
    private friendsService: FriendsService,
    private emitter: RealtimeEmitterService
  ) {}

  async markInterested(userId: number, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      await this.prisma.eventInterest.create({
        data: { userId, eventId },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
        throw error;
      }
    }

    const count = await this.getInterestCount(eventId);

    this.emitter.emitToEvent(eventId, 'interest:updated', {
      eventId,
      userId,
      interested: true,
      count,
    });

    return { interested: true, count };
  }

  async removeInterest(userId: number, eventId: string) {
    await this.prisma.eventInterest.deleteMany({
      where: { userId, eventId },
    });

    const count = await this.getInterestCount(eventId);

    this.emitter.emitToEvent(eventId, 'interest:updated', {
      eventId,
      userId,
      interested: false,
      count,
    });

    return { interested: false, count };
  }

  async getInterestCount(eventId: string): Promise<number> {
    return this.prisma.eventInterest.count({ where: { eventId } });
  }

  async isUserInterested(userId: number, eventId: string): Promise<boolean> {
    const interest = await this.prisma.eventInterest.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    return !!interest;
  }

  async getFriendsInterested(userId: number, eventId: string) {
    const friendIds = await this.friendsService.getFriendIds(userId);

    if (friendIds.length === 0) {
      return [];
    }

    return this.prisma.eventInterest.findMany({
      where: {
        eventId,
        userId: { in: friendIds },
      },
      include: {
        user: {
          select: SAFE_USER_SELECT,
        },
      },
    });
  }

  async getStatus(userId: number, eventId: string) {
    const [isInterested, count] = await Promise.all([
      this.isUserInterested(userId, eventId),
      this.getInterestCount(eventId),
    ]);

    return { isInterested, count };
  }
}

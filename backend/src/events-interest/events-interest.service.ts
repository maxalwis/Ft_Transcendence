import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class EventsInterestsService {
  constructor(
    private prisma: PrismaService,
    private friendsService: FriendsService
  ) {}

  async markInterested(userId: number, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.eventInterest.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: { userId, eventId },
      update: {},
    });
  }

  async removeInterest(userId: number, eventId: string) {
    return this.prisma.eventInterest.deleteMany({
      where: { userId, eventId },
    });
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
    if (friendIds.length === 0) return [];

    return this.prisma.eventInterest.findMany({
      where: {
        eventId,
        userId: { in: friendIds },
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
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

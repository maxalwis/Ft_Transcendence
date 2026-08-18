import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from '../../generated/prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { content, userId, eventId } = createMessageDto;

    if (!eventId) {
      throw new NotFoundException('Event ID is required');
    }

    // Run user and event lookups in parallel
    const [user, event] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.event.findUnique({ where: { id: eventId } }),
    ]);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return this.prisma.message.create({
      data: {
        content,
        userId,
        eventId,
      },
      include: {
        user: true,
      },
    });
  }

  async findByEvent(eventId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { eventId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

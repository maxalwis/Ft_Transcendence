import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { User, Message } from '../generated/prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { content, userId, eventId } = createMessageDto;

    // Ensure the user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Ensure the event exists
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        userId: createMessageDto.userId,
        eventId: createMessageDto.eventId!,
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

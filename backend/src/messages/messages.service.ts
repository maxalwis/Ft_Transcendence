import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { User, Message } from '../generated/prisma/client';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: RealtimeEmitterService
  ) {}

  async create(userId: number, createMessageDto: CreateMessageDto): Promise<Message> {
    const { content, eventId } = createMessageDto;

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

    const message = await this.prisma.message.create({
      data: {
        content,
        userId,
        eventId,
      },
      include: {
        user: true,
      },
    });

    this.emitter.emitToEvent(eventId, 'message:new', message);

    return message;
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

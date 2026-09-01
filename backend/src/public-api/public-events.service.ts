import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';

@Injectable()
export class PublicEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryEventsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateStart: 'asc' },
      }),
      this.prisma.event.count(),
    ]);
    return { page, limit, total, items };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  async create(dto: CreateEventDto) {
    const event = await this.prisma.event.create({ data: dto });
    await this.syncLocation(event.id, event.latitude, event.longitude);
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    const event = await this.prisma.event.update({ where: { id }, data: dto });
    await this.syncLocation(event.id, event.latitude, event.longitude);
    return event;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Prisma cannot write the PostGIS `location` column (Unsupported type), so we
   * derive the geography point from latitude/longitude with raw SQL, mirroring
   * what the ingestion service does. Without this, API-created events have a
   * null location and never appear in the map query.
   */
  private async syncLocation(
    id: string,
    latitude?: number | null,
    longitude?: number | null
  ): Promise<void> {
    if (latitude == null || longitude == null) return;
    await this.prisma.$executeRaw`
      UPDATE "Event"
      SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      WHERE id = ${id}
    `;
  }
}

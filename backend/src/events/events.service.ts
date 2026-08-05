import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findForMap(bboxString: string) {
    const [minLon, minLat, maxLon, maxLat] = bboxString.split(',').map(Number);

    return this.prisma.$queryRaw`
			SELECT id, title, "dateStart", "dateEnd", latitude, longitude
			FROM "Event"
			WHERE location && ST_MakeEnvelope(
				${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326
			)
			LIMIT 500
		`;
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }
}

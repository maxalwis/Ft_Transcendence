import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoundingBox } from './dto/bounding-box.interface';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Query tous les éléments présents dans un carré délimité par
  // les coordonnées passées en argument. Niveau de détail minimal
  async findForMap(bbox: BoundingBox) {
    const { minLon, minLat, maxLon, maxLat } = bbox;

    return this.prisma.$queryRaw`
			SELECT id, title, "dateStart", "dateEnd", latitude, longitude
			FROM "Event"
			WHERE location && ST_MakeEnvelope(
				${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326
			)
        AND "dateEnd" >= NOW()
			LIMIT 500
		`;
  }

  // Renvoie toutes les colonnes d'un event particulier
  // à partir de son id
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }
}

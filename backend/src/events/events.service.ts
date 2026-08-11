import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoundingBox } from './dto/bounding-box.interface';
import { NearbyQueryDto } from './dto/map-query.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Query tous les éléments présents dans un carré délimité par
  // les coordonnées passées en argument. Niveau de détail minimal
  async findForMap(bbox: BoundingBox) {
    const { minLon, minLat, maxLon, maxLat } = bbox;

    return this.prisma.$queryRaw`
			SELECT id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude
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

  // Renvoie les 100 events les plus proches, du plus proche au plus éloigné,
  // dans un rayon de 'radius' mètres
  async findNearby(query: NearbyQueryDto) {
    const { lat, lon, radius } = query;

    return this.prisma.$queryRaw`
      SELECT
        id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography -- convertit les nombres en coordonnées terrestres
          ) AS distance -- distance entre le point entré en argument et tous les events
      FROM "Event"
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
        ${radius}
      )
        AND "dateEnd" >= NOW()
      ORDER BY distance ASC
      LIMIT 100`
  }
}

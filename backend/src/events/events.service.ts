import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { BoundingBox } from './dto/bounding-box.interface';
import { NearbyQueryDto } from './dto/map-query.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Fetch all markers up to 5,000 without requiring a bounding box
  async findAllForMap(from?: string, to?: string, category?: string, price?: string) {
    const fromDate = from ? new Date(from) : new Date();
    const defaultToDate = to ? new Date(to) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const priceSearch = price ? `%${price}%` : null;

    return this.prisma.$queryRaw`
        SELECT id, title, category, latitude, longitude, "dateStart", "dateEnd", "priceType", "priceDetail"
        FROM "Event"
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            AND "dateEnd" >= ${fromDate}
            AND "dateStart" <= ${defaultToDate}
            ${category ? Prisma.sql`AND ${category} = ANY(category)` : Prisma.empty}
            ${priceSearch ? Prisma.sql`AND ("priceType" ILIKE ${priceSearch} OR "priceDetail" ILIKE ${priceSearch})` : Prisma.empty}
        ORDER BY "dateStart" ASC
        LIMIT 5000
    `;
  }

  // Keep for backwards compatibility when bbox is provided
  async findForMap(bbox: BoundingBox, from?: string, to?: string, category?: string, price?: string) {
    const { minLon, minLat, maxLon, maxLat } = bbox;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : undefined;
    const priceSearch = price ? `%${price}%` : null;

    return this.prisma.$queryRaw`
      SELECT id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail"
      FROM "Event"
      WHERE location && ST_MakeEnvelope(
        ${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326
      )
        AND "dateEnd" >= ${fromDate}
        ${toDate ? Prisma.sql`AND "dateStart" <= ${toDate}` : Prisma.empty}
        ${category ? Prisma.sql`AND ${category} = ANY(category)` : Prisma.empty}
        ${priceSearch ? Prisma.sql`AND ("priceType" ILIKE ${priceSearch} OR "priceDetail" ILIKE ${priceSearch})` : Prisma.empty}
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

  async findNearby(query: NearbyQueryDto, from?: string, to?: string, category?: string, price?: string) {
    const { lon, lat } = query.center;
    const { radius } = query;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : undefined;
    const priceSearch = price ? `%${price}%` : null;

    return this.prisma.$queryRaw`
      SELECT
        id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail",
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
        ) AS distance
      FROM "Event"
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
        ${radius}
      )
        AND "dateEnd" >= ${fromDate}
        ${toDate ? Prisma.sql`AND "dateStart" <= ${toDate}` : Prisma.empty}
        ${category ? Prisma.sql`AND ${category} = ANY(category)` : Prisma.empty}
        ${priceSearch ? Prisma.sql`AND ("priceType" ILIKE ${priceSearch} OR "priceDetail" ILIKE ${priceSearch})` : Prisma.empty}
      ORDER BY distance ASC
      LIMIT 100
    `;
  }
}
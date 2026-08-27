import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { BoundingBox } from './dto/bounding-box.interface';
import { NearbyQueryDto } from './dto/map-query.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  private getPriceCondition(price?: string) {
    if (!price) return Prisma.empty;

    const trimmed = price.trim().toLowerCase();

    if (trimmed === 'free') {
      // Filtrage strict : on exclut les textes piégés contenant des exceptions ou des tarifs
      return Prisma.sql`AND (
        LOWER("priceType") IN ('gratuit', 'free', 'gratuite') 
        OR LOWER("priceDetail") IN ('gratuit', 'free', '0', '0.0€', '0 €', '0.00 €')
        OR ("priceDetail" ILIKE '%gratuit%' AND "priceDetail" NOT ILIKE '%sauf%' AND "priceDetail" NOT ILIKE '%€%')
        OR "priceDetail" ILIKE '%free%'
      )`;
    }

    if (trimmed === 'fee-based' || trimmed === 'payant') {
      return Prisma.sql`AND NOT (
        LOWER("priceType") IN ('gratuit', 'free', 'gratuite') 
        OR LOWER("priceDetail") IN ('gratuit', 'free', '0', '0.0€', '0 €', '0.00 €')
        OR ("priceDetail" ILIKE '%gratuit%' AND "priceDetail" NOT ILIKE '%sauf%' AND "priceDetail" NOT ILIKE '%€%')
        OR "priceDetail" ILIKE '%free%'
      )`;
    }

    return Prisma.empty;
  }

  private getCategoryCondition(category?: string) {
    if (!category) return Prisma.empty;

    if (category.toLowerCase() === 'culture') {
      return Prisma.sql`AND EXISTS (
        SELECT 1 FROM unnest(category) c 
        WHERE c ILIKE ANY (ARRAY['%theatr%', '%danse%', '%spectacle%', '%balade%', '%conference%', '%exposition%', '%festival%', '%culture%'])
      )`;
    }

    return Prisma.sql`AND EXISTS (SELECT 1 FROM unnest(category) c WHERE LOWER(TRIM(c)) = LOWER(TRIM(${category})))`;
  }

  async findAllForMap(from?: string, to?: string, category?: string, price?: string) {
    const fromDate = from ? new Date(from) : new Date();
    const defaultToDate = to ? new Date(to) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);

    const events: any[] = await this.prisma.$queryRaw`
        SELECT id, title, category, latitude, longitude, "dateStart", "dateEnd", "priceType", "priceDetail"
        FROM "Event"
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            AND "dateEnd" >= ${fromDate}
            AND "dateStart" <= ${defaultToDate}
            ${categoryCondition}
            ${priceCondition}
        ORDER BY "dateStart" ASC
        LIMIT 5000
    `;

    return events;
  }

  async findForMap(bbox: BoundingBox, from?: string, to?: string, category?: string, price?: string) {
    const { minLon, minLat, maxLon, maxLat } = bbox;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : undefined;
    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);

    const events: any[] = await this.prisma.$queryRaw`
      SELECT id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail"
      FROM "Event"
      WHERE location && ST_MakeEnvelope(
        ${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326
      )
        AND "dateEnd" >= ${fromDate}
        ${toDate ? Prisma.sql`AND "dateStart" <= ${toDate}` : Prisma.empty}
        ${categoryCondition}
        ${priceCondition}
      LIMIT 500
    `;

    return events;
  }

  async findOne(id: string) {
    const events = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, description, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail"
      FROM "Event"
      WHERE id = ${id}
      LIMIT 1
    `;

    const event = events[0];
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
    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);

    const events: any[] = await this.prisma.$queryRaw`
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
        ${categoryCondition}
        ${priceCondition}
      ORDER BY distance ASC
      LIMIT 100
    `;

    return events;
  }
}
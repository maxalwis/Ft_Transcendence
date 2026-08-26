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
      return Prisma.sql`AND ("priceType" ILIKE '%gratuit%' OR "priceType" ILIKE '%free%' OR "priceDetail" ILIKE '%gratuit%' OR "priceDetail" ILIKE '%free%' OR "priceDetail" LIKE '%0 €%' OR "priceDetail" LIKE '%0.00%')`;
    }

    if (trimmed === 'fee-based' || trimmed === 'payant' || price.includes('-')) {
      return Prisma.sql`AND NOT ("priceType" ILIKE '%gratuit%' OR "priceType" ILIKE '%free%' OR "priceDetail" ILIKE '%gratuit%' OR "priceDetail" ILIKE '%free%' OR "priceDetail" LIKE '%0 €%' OR "priceDetail" LIKE '%0.00%')`;
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

  private matchesPriceRange(ev: { priceDetail?: string | null; priceType?: string | null }, priceFilter: string): boolean {
    const rawDetail = (ev.priceDetail || ev.priceType || '');
    const detail = rawDetail.replace(/<[^>]*>?/gm, ' ').toLowerCase();

    const isFreeEvent = 
      detail.includes('gratuit') || 
      detail.includes('free') || 
      detail === '0' || 
      detail === '0.00' ||
      detail.includes('0 €') ||
      detail === ''; // Exclut les événements sans détail de prix pour les filtres payants

    const filterLower = priceFilter.toLowerCase();

    if (filterLower === 'free') {
      return isFreeEvent;
    }

    if (filterLower === 'fee-based' || filterLower === 'payant' || priceFilter.includes('-')) {
      if (isFreeEvent) return false;

      if (!priceFilter.includes('-')) {
        return true; 
      }

      const [minStr, maxStr] = priceFilter.split('-');
      const minVal = parseFloat(minStr);
      const maxVal = parseFloat(maxStr);

      if (!isNaN(minVal) && !isNaN(maxVal)) {
        const matches = detail.match(/(\d+[\d.,]*)\s*(?:€|eur|euros?)/g);
        
        let prices: number[] = [];
        if (matches && matches.length > 0) {
          prices = matches.map((m: string) => parseFloat(m.replace(/[^\d,.]/g, '').replace(',', '.'))).filter((p: number) => !isNaN(p));
        }

        if (prices.length === 0) {
          const rawMatches = detail.match(/(\d+[\d.,]*)/g);
          if (!rawMatches) return false; // Masque par sécurité si aucun prix chiffré n'est trouvé
          prices = rawMatches.map((m: string) => parseFloat(m.replace(',', '.'))).filter((p: number) => !isNaN(p));
        }

        if (prices.length === 0) return false;

        const eventMin = Math.min(...prices);
        const eventMax = Math.max(...prices);

        return eventMin <= maxVal && eventMax >= minVal;
      }
    }

    return true;
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

    if (price) {
      return events.filter(ev => this.matchesPriceRange(ev, price));
    }

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

    if (price) {
      return events.filter(ev => this.matchesPriceRange(ev, price));
    }

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

    if (price) {
      return events.filter(ev => this.matchesPriceRange(ev, price));
    }

    return events;
  }
}
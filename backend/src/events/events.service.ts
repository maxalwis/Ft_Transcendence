import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { BoundingBox } from './dto/bounding-box.interface';
import { NearbyQueryDto } from './dto/map-query.dto';
import { TranslationsService } from '../translations/translations.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private translations: TranslationsService
  ) {}

  private getPriceCondition(price?: string) {
    if (!price) return Prisma.empty;

    const trimmed = price.trim().toLowerCase();

    if (trimmed === 'free') {
      return Prisma.sql`AND LOWER("priceType") IN ('gratuit', 'gratuit sous condition')`;
    }

    if (trimmed === 'fee-based') {
      return Prisma.sql`AND LOWER("priceType") = 'payant'`;
    }

    return Prisma.empty;
  }

  private getCategoryCondition(category?: string) {
    if (!category || category.trim() === '') return Prisma.empty;

    const cat = category.toLowerCase().trim();

    // Button 1: Musique (Matches Concert, Festival, Spectacle musical)
    if (cat === 'musique' || cat === 'music') {
      return Prisma.sql`AND EXISTS (
      SELECT 1 FROM unnest(category) c
      WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[
        '%concert%', '%musique%', '%festival%', '%spectacle musical%'
      ])
    )`;
    }

    // Button 2: Culture
    if (cat === 'culture') {
      return Prisma.sql`AND EXISTS (
      SELECT 1 FROM unnest(category) c
      WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[
        '%théâtre%', '%theatre%', '%expo%', '%danse%', '%art%', '%histoire%', '%littérature%', '%cinéma%', '%cinema%'
      ])
    )`;
    }

    // Button 3: Ateliers & Conférences
    if (cat === 'ateliers' || cat === 'atelier' || cat === 'conference') {
      return Prisma.sql`AND EXISTS (
      SELECT 1 FROM unnest(category) c
      WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[
        '%atelier%', '%conférence%', '%conference%', '%rencontre%'
      ])
    )`;
    }

    // Button 4: Loisirs & Sports
    if (cat === 'loisirs' || cat === 'sport') {
      return Prisma.sql`AND EXISTS (
      SELECT 1 FROM unnest(category) c
      WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[
        '%loisirs%', '%sport%', '%balade%', '%nature%', '%santé%', '%sante%', '%enfants%'
      ])
    )`;
    }

    // Button 5: Autres
    if (cat === 'autres' || cat === 'empty' || cat === 'other') {
      return Prisma.sql`AND (
      cardinality(category) = 0
      OR category IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM unnest(category) c
        WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[
          '%concert%', '%musique%', '%festival%', '%spectacle musical%',
          '%théâtre%', '%theatre%', '%expo%', '%danse%', '%art%', '%histoire%', '%littérature%', '%cinéma%', '%cinema%',
          '%atelier%', '%conférence%', '%conference%', '%rencontre%',
          '%loisirs%', '%sport%', '%balade%', '%nature%', '%santé%', '%sante%', '%enfants%'
        ])
      )
    )`;
    }

    // Fallback match
    return Prisma.sql`AND EXISTS (
    SELECT 1 FROM unnest(category) c
    WHERE LOWER(TRIM(c)) = ${cat}
  )`;
  }

  private getCityCondition(city?: string) {
    if (!city || city.trim() === '') return Prisma.empty;

    return Prisma.sql`AND "city" ILIKE ${`%${city.trim()}%`}`;
  }

  async findAllForMap(
    from?: string,
    to?: string,
    category?: string,
    price?: string,
    city?: string
  ) {
    const fromDate = from ? new Date(from) : new Date();
    const defaultToDate = to ? new Date(to) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);
    const cityCondition = this.getCityCondition(city);

    this.logger.log(`Executing SQL map query -> Category: "${category}", City: "${city}"`);

    const results: any[] = await this.prisma.$queryRaw`
      SELECT id, title, category, latitude, longitude, "dateStart", "dateEnd", "coverUrl", "priceType", "priceDetail", "accessLink"
      FROM "Event"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND "dateEnd" >= ${fromDate}
          AND "dateStart" <= ${defaultToDate}
          ${categoryCondition}
          ${priceCondition}
          ${cityCondition}
      ORDER BY "dateStart" ASC
      LIMIT 5000
  `;

    this.logger.log(
      `SQL Query finished -> Category "${category}" returned ${results.length} records.`
    );

    return results;
  }

  async findForMap(
    bbox: BoundingBox,
    from?: string,
    to?: string,
    category?: string,
    price?: string
  ) {
    const { minLon, minLat, maxLon, maxLat } = bbox;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : undefined;
    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);

    return this.prisma.$queryRaw`
      SELECT id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail", "accessLink"
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
  }

  async findOne(id: string, lang: string = 'fr') {
    const events = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, description, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail", "accessLink"
      FROM "Event"
      WHERE id = ${id}
      LIMIT 1
    `;

    const event = events[0];
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    const [title, priceDetail, category] = await Promise.all([
      this.translations.getTranslatedTitle(id, lang),
      this.translations.getTranslatedPriceDetail(id, lang),
      this.translations.getTranslatedCategory(id, lang),
    ]);

    return {
      ...event,
      title,
      priceDetail,
      category: category ? [category] : event.category,
    };
  }

  async findNearby(
    query: NearbyQueryDto,
    from?: string,
    to?: string,
    category?: string,
    price?: string
  ) {
    const { lon, lat } = query.center;
    const { radius } = query;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : undefined;
    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);

    return this.prisma.$queryRaw`
      SELECT
        id, title, "dateStart", "dateEnd", "coverUrl", latitude, longitude, category, "priceType", "priceDetail", "accessLink",
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
  }
}

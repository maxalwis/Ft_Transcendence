import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { BoundingBox } from './dto/bounding-box.interface';
import {
  NearbyQueryDto,
  SearchEventsQueryDto,
  EventSortField,
  SortOrder,
} from './dto/map-query.dto';
import { TranslationsService } from '../translations/translations.service';
import { CategoryButton, CATEGORY_KEYWORDS } from './category-taxonomy';

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

    const cat = category.toLowerCase().trim() as CategoryButton;

    if (cat === 'autres') {
      const allPatterns = Object.values(CATEGORY_KEYWORDS)
        .flat()
        .map((keyword) => `%${keyword}%`);
      return Prisma.sql`AND (
      cardinality(category) = 0
      OR category IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM unnest(category) c
        WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[${Prisma.join(allPatterns)}])
      )
    )`;
    }

    if (cat in CATEGORY_KEYWORDS) {
      const patterns = CATEGORY_KEYWORDS[cat].map((keyword) => `%${keyword}%`);
      return Prisma.sql`AND EXISTS (
      SELECT 1 FROM unnest(category) c
      WHERE LOWER(TRIM(c)) LIKE ANY (ARRAY[${Prisma.join(patterns)}])
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

  // Recherche texte : titre, description ou nom du lieu (ILIKE paramétré, pas d'injection)
  private getTextCondition(q?: string) {
    if (!q || q.trim() === '') return Prisma.empty;

    // % et _ sont des jokers LIKE : on les échappe pour chercher le texte tel quel
    const pattern = `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    return Prisma.sql`AND ("title" ILIKE ${pattern} OR "description" ILIKE ${pattern} OR "addressName" ILIKE ${pattern})`;
  }

  // Liste blanche : le champ de tri et le sens ne viennent jamais directement de l'utilisateur.
  // L'id en dernier critère rend l'ordre stable d'une page à l'autre.
  private getOrderBy(sort: EventSortField, order: SortOrder) {
    const direction = order === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
    const columns: Record<EventSortField, Prisma.Sql> = {
      date: Prisma.sql`e."dateStart"`,
      // Ignore la ponctuation de tête (guillemets, « ...) pour un ordre alphabétique naturel
      title: Prisma.sql`LOWER(regexp_replace(e."title", '^[^[:alnum:]]+', ''))`,
      popularity: Prisma.sql`"interestCount"`,
    };
    return Prisma.sql`ORDER BY ${columns[sort]} ${direction}, e."dateStart" ASC, e.id ASC`;
  }

  async search(query: SearchEventsQueryDto) {
    const { q, city, from, to, category, price, sort, order, page, limit } = query;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const where = Prisma.sql`
      WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL
        AND e."dateEnd" >= ${fromDate}
        AND e."dateStart" <= ${toDate}
        ${this.getCategoryCondition(category)}
        ${this.getPriceCondition(price)}
        ${this.getCityCondition(city)}
        ${this.getTextCondition(q)}
    `;

    const [countRows, data] = await Promise.all([
      this.prisma.$queryRaw<{ total: bigint }[]>`
        SELECT COUNT(*) AS total FROM "Event" e ${where}
      `,
      this.prisma.$queryRaw<unknown[]>`
        SELECT e.id, e.title, e.category, e.latitude, e.longitude, e."dateStart", e."dateEnd",
               e."coverUrl", e."priceType", e."priceDetail", e."accessLink",
               (SELECT COUNT(*)::int FROM "EventInterest" i WHERE i."eventId" = e.id) AS "interestCount"
        FROM "Event" e
        ${where}
        ${this.getOrderBy(sort, order)}
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `,
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAllForMap(
    from?: string,
    to?: string,
    category?: string,
    price?: string,
    city?: string,
    q?: string
  ) {
    const fromDate = from ? new Date(from) : new Date();
    const defaultToDate = to ? new Date(to) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const priceCondition = this.getPriceCondition(price);
    const categoryCondition = this.getCategoryCondition(category);
    const cityCondition = this.getCityCondition(city);
    const textCondition = this.getTextCondition(q);

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
          ${textCondition}
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
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        dateStart: true,
        dateEnd: true,
        coverUrl: true,
        latitude: true,
        longitude: true,
        category: true,
        priceType: true,
        priceDetail: true,
        accessLink: true,
        _count: { select: { interests: true } },
      },
    });

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

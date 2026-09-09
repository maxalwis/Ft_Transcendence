import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import sanitizeHtml from 'sanitize-html';

export interface IngestedEventData {
  source: string;
  externalId: string;
  title: string;
  description: string | null;
  dateStart: Date;
  dateEnd: Date;
  coverUrl: string | null;
  addressName: string | null;
  addressStreet: string | null;
  zipCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  priceType: string | null;
  priceDetail: string | null;
  category: string[];
  accessLink: string | null;
  audience: string | null;
  rank: number | null;
  weight: number | null;
}

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private readonly LAST_INGESTION_KEY = 'LAST_DAILY_INGESTION_DATE';

  constructor(private readonly prisma: PrismaService) {}

  // Skip automatic execution in test environments
  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      this.logger.log('Skipping automatic ingestion on init during tests.');
      return;
    }

    try {
      const shouldRun = await this.shouldRunIngestionToday();

      if (shouldRun) {
        this.logger.log('New day or first build detected. Triggering ingestion...');
        // Run in background to avoid blocking container readiness
        this.handleDailyIngestionAndCleanup().catch((err) =>
          this.logger.error('Background ingestion failed:', err)
        );
      } else {
        this.logger.log('Ingestion already completed today. Skipping startup run.');
      }
    } catch (error) {
      this.logger.error('Error during startup ingestion check:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyIngestionAndCleanup() {
    this.logger.log('Starting daily ingestion and cleanup job...');
    try {
      const now = new Date();

      // Clean up past events
      const deleted = await this.prisma.event.deleteMany({
        where: { dateEnd: { lt: now } },
      });
      this.logger.log(`Cleanup complete: Removed ${deleted.count} past events.`);

      // Perform ingestion
      await this.fetchFromMairieParis();

      // Persist completion date (YYYY-MM-DD string)
      const todayStr = new Date().toISOString().split('T')[0];
      await this.prisma.systemState.upsert({
        where: { key: this.LAST_INGESTION_KEY },
        update: { value: todayStr },
        create: { key: this.LAST_INGESTION_KEY, value: todayStr },
      });

      this.logger.log('Scheduled ingestion successfully completed and state saved.');
    } catch (error) {
      this.logger.error('Error during job execution:', error);
    }
  }

  private async shouldRunIngestionToday(): Promise<boolean> {
    const record = await this.prisma.systemState.findUnique({
      where: { key: this.LAST_INGESTION_KEY },
    });

    if (!record) return true; // Never run before

    const todayStr = new Date().toISOString().split('T')[0];
    return record.value !== todayStr; // True if record is from yesterday or earlier
  }

  async fetchFromMairieParis() {
    const baseUrl =
      'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records';
    const limit = 100;
    let offset = 0;
    let totalCount = Infinity;
    let totalIngested = 0;

    // Limit pagination depth during test runs to avoid hitting external rate limits/timeouts
    const isTest = process.env.NODE_ENV === 'test';
    const maxOffset = isTest ? limit : Infinity;

    while (offset < totalCount && offset < maxOffset) {
      const url = `${baseUrl}?limit=${limit}&offset=${offset}`;

      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

        if (!response.ok) {
          this.logger.error(`Failed to fetch page at offset ${offset}: ${response.statusText}`);
          break;
        }

        const data = await response.json();
        if (totalCount === Infinity) {
          totalCount = data.total_count ?? 0;
        }

        if (!data.results || data.results.length === 0) break;

        const mappedEvents: IngestedEventData[] = data.results.map((item: any) =>
          this.mapToEvent(item)
        );
        await Promise.all(mappedEvents.map((eventData) => this.upsertEvent(eventData)));

        totalIngested += data.results.length;
        this.logger.log(`Fetched ${data.results.length} events (offset ${offset}/${totalCount})`);
        offset += limit;
      } catch (error) {
        this.logger.error(`Error processing offset ${offset}:`, error);
        break;
      }
    }

    this.logger.log(`Ingestion complete: ${totalIngested} events processed`);
  }

  private parseDelimitedString(value: string | null | undefined, delimiter = ';'): string[] {
    if (!value) return [];
    return value
      .split(delimiter)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  private parseDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  // normalise URL : www.abc.com -> https://www.abc.com
  private normalizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      return new URL(candidate).href;
    } catch {
      this.logger.warn(`Invalid URL ignored during ingestion: ${trimmed}`);
      return null;
    }
  }

  private stripHtml(value: string | null | undefined): string | null {
    if (!value) return null;
    const cleaned = sanitizeHtml(value.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
    return cleaned || null;
  }

  private mapToEvent(item: any): IngestedEventData {
    return {
      source: 'mairie_paris',
      externalId: item.id,
      title: item.title ?? 'Sans titre',
      description: item.lead_text ?? null,
      dateStart: this.parseDate(item.date_start) ?? new Date(),
      dateEnd: this.parseDate(item.date_end) ?? new Date(),
      coverUrl: item.cover_url ?? null,
      addressName: item.address_name ?? null,
      addressStreet: item.address_street ?? null,
      zipCode: item.address_zipcode ?? null,
      city: item.address_city ?? null,
      latitude: item.lat_lon?.lat ?? null,
      longitude: item.lat_lon?.lon ?? null,
      priceType: item.price_type ?? null,
      priceDetail: this.stripHtml(item.price_detail),
      category: this.parseDelimitedString(item.qfap_tags),
      accessLink: this.normalizeUrl(item.access_link),
      audience: item.audience ?? null,
      rank: item.rank ? parseFloat(item.rank) : null,
      weight: item.weight ? parseInt(item.weight, 10) : null,
    };
  }

  private async upsertEvent(data: IngestedEventData) {
    if (!data.externalId) return null;

    const { source, externalId, ...eventPayload } = data;
    const event = await this.prisma.event.upsert({
      where: { source_externalId: { source, externalId } },
      update: eventPayload,
      create: { source, externalId, ...eventPayload },
    });

    if (data.latitude != null && data.longitude != null) {
      await this.prisma.$executeRaw`
        UPDATE "Event"
        SET location = ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326)::geography
        WHERE id = ${event.id}
      `;
    }

    return event;
  }
}

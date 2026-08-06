import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private prisma: PrismaService) {}

  // fonction pour aller chercher tous les events du dataset de la Mairie de Paris.
  // Boucle pour récupérer les events page par page (limite de 100 résultats par page)
  async fetchFromMairieParis() {
    const baseUrl =
      'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records';
    const limit = 100;
    let offset = 0;
    let totalCount = Infinity;
    let totalIngested = 0;

    while (offset < totalCount) {
      const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
      const response = await fetch(url);

      if (!response.ok) {
        this.logger.error(`Failed to fetch page at offset ${offset}: ${response.statusText}`);
        break;
      }

      const data = await response.json();
      if (totalCount === Infinity) {
        totalCount = data.total_count;
      }

      for (const item of data.results) {
        await this.upsertEvent(this.mapToEvent(item));
        totalIngested++;
      }

      this.logger.log(`Fetched ${data.results.length} events (offset ${offset}/${totalCount})`);
      offset += limit;
    }

    this.logger.log(`Ingestion complete: ${totalIngested} events processed`);
  }

  // fonction de transformation d'un item tel que renvoyé par l'API Mairie de Paris
  // en un objet qui correspond au format défini dans schema.prisma
  private mapToEvent(item: any) {
    return {
      source: 'mairie_paris',
      externalId: item.id,
      title: item.title,
      description: item.lead_text,
      dateStart: new Date(item.date_start),
      dateEnd: new Date(item.date_end),
      coverUrl: item.cover_url,
      addressName: item.address_name,
      addressStreet: item.address_street,
      zipCode: item.address_zipcode,
      city: item.address_city,
      latitude: item.lat_lon?.lat,
      longitude: item.lat_lon?.lon,
      priceType: item.price_type,
      priceDetail: item.price_detail,
    };
  }

  // cherche si un event dont la combinaison source + external_id existe déjà
  // met à jour ou crée en fonction de si l'event existe ou non
  private async upsertEvent(data: any) {
    const event = await this.prisma.event.upsert({
      where: { source_externalId: { source: data.source, externalId: data.externalId } },
      update: data,
      create: data,
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

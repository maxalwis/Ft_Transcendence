import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngestionService {
	private readonly logger = new Logger(IngestionService.name);

	constructor(private prisma: PrismaService) {}

	async fetchFromMairieParis() {
	const baseUrl = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records';
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
		totalCount = data.total_count;

		for (const item of data.results) {
			await this.upsertEvent(this.mapToEvent(item));
			totalIngested++;
		}

		this.logger.log(`Fetched ${data.results.length} events (offset ${offset}/${totalCount})`);
		offset += limit;
	}

	this.logger.log(`Ingestion complete: ${totalIngested} events processed`);
	}

	private mapToEvent(item: any) {
		return {
			source: "mairie_paris",
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
			priceDetail: item.price_detail
		}
	}

	private async upsertEvent(data: any) {
		return this.prisma.event.upsert({
			where: { source_externalId: { source: data.source, externalId: data.externalId } },
			update: data,
			create: data,
    	});
	}
}

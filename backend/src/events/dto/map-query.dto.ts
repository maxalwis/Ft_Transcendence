import { Transform, Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import {
  IsOptional,
  IsISO8601,
  IsNumber,
  IsPositive,
  Max,
  IsDefined,
  IsString,
  IsIn,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import type { BoundingBox } from './bounding-box.interface';
import type { CenterPoint } from './center-point.interface';

// Parse et valide "minLon,minLat,maxLon,maxLat" reçu en query param
export class MapQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (typeof value !== 'string') {
      throw new BadRequestException('bounding box must be a string');
    }

    const parts = value.split(',').map(Number);

    if (parts.length !== 4 || parts.some(isNaN)) {
      throw new BadRequestException(
        'bounding box must be in the format "minLon,minLat,maxLon,maxLat"'
      );
    }

    const [minLon, minLat, maxLon, maxLat] = parts;

    if (minLon >= maxLon || minLat >= maxLat) {
      throw new BadRequestException(
        'bounding box is invalid: min values must be lower than max values'
      );
    }

    return { minLon, minLat, maxLon, maxLat };
  })
  bbox?: BoundingBox;

  @IsOptional()
  @IsString()
  city?: string;

  // Recherche plein texte (titre, description, lieu), insensible à la casse
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  // --- FILTRES ---

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  price?: string;
}

// Parse et valide "lon,lat" reçu en query param 'center'
export class NearbyQueryDto {
  @IsDefined()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      throw new BadRequestException('center must be a string');
    }
    const parts = value.split(',').map(Number);
    if (parts.length !== 2 || parts.some(isNaN)) {
      throw new BadRequestException('center must be in the format "lon,lat"');
    }
    const [lon, lat] = parts;
    return { lon, lat };
  })
  center!: CenterPoint;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(20000) // 20 km max radius
  radius!: number;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  // --- FILTRES POUR NEARBY ---

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  price?: string;
}

// Colonnes de tri autorisées (liste blanche : jamais de valeur utilisateur dans le SQL)
export const EVENT_SORT_FIELDS = ['date', 'title', 'popularity'] as const;
export type EventSortField = (typeof EVENT_SORT_FIELDS)[number];
export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

// GET /events/search : mêmes filtres que la carte, plus tri et pagination côté serveur
export class SearchEventsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsIn(EVENT_SORT_FIELDS)
  sort: EventSortField = 'date';

  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}

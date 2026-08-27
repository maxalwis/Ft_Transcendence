import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'manual', description: 'Origin of the event' })
  @IsString()
  @IsNotEmpty()
  source!: string;

  @ApiProperty({ example: 'Concert at Parc de la Villette' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '2026-09-01T18:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  dateStart!: Date;

  @ApiProperty({ example: '2026-09-01T22:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  dateEnd!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ type: [String], example: ['music', 'concert'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: string[];
}

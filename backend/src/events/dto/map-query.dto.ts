import { Transform, Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { IsDefined, IsNumber, IsPositive, Max } from 'class-validator';
import { BoundingBox } from './bounding-box.interface';

// Parse et valide "minLon,minLat,maxLon,maxLat" reçu en query param
export class MapQueryDto {
  @IsDefined()
  @Transform(({ value }) => {
    if (typeof value != 'string') {
      throw new BadRequestException('bounding box must be a string');
    }

    const parts = value.split(',').map(Number);

    if (parts.length != 4 || parts.some(isNaN)) {
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
  bbox!: BoundingBox;
}

export class NearbyQueryDto {
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lon!: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(20000) // on peut chercher dans un rayon de 20 km max
  radius!: number; //en mètres

}

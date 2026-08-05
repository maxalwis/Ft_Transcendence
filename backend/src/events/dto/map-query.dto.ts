import { IsString, Matches } from 'class-validator';

export class MapQueryDto {
  @IsString()
  // Format attendu : "minLon,minLat,maxLon,maxLat"
  @Matches(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/, {
    message: 'bbox must be in the format "minLon,minLat,maxLon,maxLat"',
  })
  bbox!: string;
}

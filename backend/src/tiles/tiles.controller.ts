import { Controller, Get, Param, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { TilesService } from './tiles.service';

// nginx caches tiles, so the global throttler would only punish normal map panning.
@SkipThrottle()
@Controller('tiles')
export class TilesController {
  constructor(private readonly tilesService: TilesService) {}

  @Get(':z/:x/:y.png')
  async getTile(
    @Param('z') z: string,
    @Param('x') x: string,
    @Param('y') y: string,
    @Res() res: Response
  ) {
    const tile = await this.tilesService.getTile(z, x, y);

    res.setHeader('Content-Type', tile.contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');

    return res.send(tile.data);
  }
}

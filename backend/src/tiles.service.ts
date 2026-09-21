import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TilesService {
  async getTile(z: string, x: string, y: string): Promise<Buffer> {
    const token = process.env.JAWG_TOKEN;

    if (!token) {
      throw new InternalServerErrorException(
        'JAWG_TOKEN is not configured',
      );
    }

    const url =
      `https://tile.jawg.io/jawg-streets/${z}/${x}/${y}.png` +
      `?access-token=${encodeURIComponent(token)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Jawg returned ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }
}
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export interface Tile {
  data: Buffer;
  contentType: string;
}

const TILE_COORD = /^\d{1,7}$/;
const TILE_Y = /^\d{1,7}(@2x)?$/;
const TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 2;

@Injectable()
export class TilesService {
  private readonly logger = new Logger(TilesService.name);
  // Concurrent requests for the same tile share a single upstream fetch.
  private readonly inflight = new Map<string, Promise<Tile>>();

  getTile(z: string, x: string, y: string): Promise<Tile> {
    if (!TILE_COORD.test(z) || !TILE_COORD.test(x) || !TILE_Y.test(y) || Number(z) > 22) {
      throw new BadRequestException('Invalid tile coordinates');
    }
    const key = `${z}/${x}/${y}`;
    let pending = this.inflight.get(key);
    if (!pending) {
      pending = this.fetchTile(z, x, y).finally(() => this.inflight.delete(key));
      this.inflight.set(key, pending);
    }
    return pending;
  }

  private async fetchTile(z: string, x: string, y: string): Promise<Tile> {
    const token = process.env.JAWG_TOKEN;
    if (!token) {
      throw new InternalServerErrorException('JAWG_TOKEN is not configured');
    }

    const url =
      `https://tile.jawg.io/jawg-streets/${z}/${x}/${y}.png` +
      `?access-token=${encodeURIComponent(token)}`;

    let lastError = 'unknown error';
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (response.ok) {
          return {
            data: Buffer.from(await response.arrayBuffer()),
            contentType: response.headers.get('content-type') ?? 'image/png',
          };
        }
        lastError = `Jawg returned ${response.status}`;
        // Client-side errors won't get better on retry.
        if (response.status >= 400 && response.status < 500 && response.status !== 429) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
    this.logger.warn(`Tile ${z}/${x}/${y} failed: ${lastError}`);
    throw new BadGatewayException('Tile upstream unavailable');
  }
}

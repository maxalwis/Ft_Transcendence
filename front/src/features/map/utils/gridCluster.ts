import type { EventGroup } from '../../../types/event';

// Web Mercator, normalized to [0, 1] on both axes (y grows southwards), like Leaflet's EPSG:3857.
const TILE_SIZE = 256;

export interface ClusterPoint {
  group: EventGroup;
  x: number;
  y: number;
}

export interface ViewRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ClusterBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export type ClusterItem =
  | { kind: 'point'; key: string; lat: number; lng: number; group: EventGroup }
  | {
      kind: 'cluster';
      key: string;
      lat: number;
      lng: number;
      count: number;
      bounds: ClusterBounds;
    };

export function projectLatLng(lat: number, lng: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI),
  };
}

// Computed once per dataset, not on every pan/zoom.
export function toClusterPoints(groups: EventGroup[]): ClusterPoint[] {
  return groups.map((group) => ({ group, ...projectLatLng(group.latitude, group.longitude) }));
}

export function getViewRange(bounds: {
  getNorth(): number;
  getSouth(): number;
  getWest(): number;
  getEast(): number;
}): ViewRange {
  const nw = projectLatLng(bounds.getNorth(), bounds.getWest());
  const se = projectLatLng(bounds.getSouth(), bounds.getEast());
  return { minX: nw.x, maxX: se.x, minY: nw.y, maxY: se.y };
}

/*
 * Grid clustering in screen space: every point falls in a cell of `cellPx` pixels anchored on the
 * world, so cells (and therefore cluster keys/counts) stay identical while panning. Only the
 * clusters/points whose centre is inside `view` are returned, which keeps the DOM small.
 */
export function clusterViewport(
  points: ClusterPoint[],
  view: ViewRange,
  zoom: number,
  cellPx: number
): ClusterItem[] {
  const cellSize = cellPx / (TILE_SIZE * 2 ** zoom);
  const cells = new Map<string, ClusterPoint[]>();

  for (const point of points) {
    const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
    const cell = cells.get(key);
    if (cell) cell.push(point);
    else cells.set(key, [point]);
  }

  const items: ClusterItem[] = [];

  for (const [cellKey, members] of cells) {
    if (members.length === 1) {
      const { group, x, y } = members[0];
      if (x < view.minX || x > view.maxX || y < view.minY || y > view.maxY) continue;
      items.push({
        kind: 'point',
        key: `p:${group.id}`,
        lat: group.latitude,
        lng: group.longitude,
        group,
      });
      continue;
    }

    let sumLat = 0;
    let sumLng = 0;
    let sumX = 0;
    let sumY = 0;
    let south = Infinity;
    let north = -Infinity;
    let west = Infinity;
    let east = -Infinity;

    for (const { group, x, y } of members) {
      sumLat += group.latitude;
      sumLng += group.longitude;
      sumX += x;
      sumY += y;
      south = Math.min(south, group.latitude);
      north = Math.max(north, group.latitude);
      west = Math.min(west, group.longitude);
      east = Math.max(east, group.longitude);
    }

    const cx = sumX / members.length;
    const cy = sumY / members.length;
    if (cx < view.minX || cx > view.maxX || cy < view.minY || cy > view.maxY) continue;

    items.push({
      kind: 'cluster',
      key: `c:${zoom}:${cellKey}`,
      lat: sumLat / members.length,
      lng: sumLng / members.length,
      count: members.length,
      bounds: { south, west, north, east },
    });
  }

  return items;
}

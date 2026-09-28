import type { EventGroup } from '../../../types/event';
import { MAX_ZOOM } from '../../../types/constants';

// Web Mercator, normalized to [0, 1] on both axes (y grows southwards), like Leaflet's EPSG:3857.
const TILE_SIZE = 256;

// Former markercluster `maxClusterRadius` values. A marker joins a cluster if it is within this
// radius of its centre, so a cluster spans up to twice that: the grid cell is the diameter.
export const getClusterRadius = (zoom: number) => {
  if (zoom <= 13) return 90;
  if (zoom <= 16) return 70;
  if (zoom <= 18) return 50;
  return 40;
};

export const getCellSize = (zoom: number) => getClusterRadius(zoom) * 2;

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

// Size (in the same normalized [0,1] world units as ClusterPoint) of a grid cell `cellPx` wide
// at the given zoom. Mirrors the cell math used inside clusterViewport.
export function cellSizeAt(zoom: number, cellPx: number): number {
  return cellPx / (TILE_SIZE * 2 ** zoom);
}

// Widest projected span (x or y) of a bounds box, in the same normalized world units.
export function projectedSpan(bounds: ClusterBounds): number {
  const sw = projectLatLng(bounds.south, bounds.west);
  const ne = projectLatLng(bounds.north, bounds.east);
  return Math.max(Math.abs(ne.x - sw.x), Math.abs(ne.y - sw.y));
}

// Size of the smallest grid cell the map will ever use, at its deepest zoom. Members closer
// together than this can never land in separate cells no matter how far the user zooms in, so
// they're merged into a single marker instead of a "cluster" bubble that could never actually split.
const MIN_CELL_SIZE = cellSizeAt(MAX_ZOOM, getCellSize(MAX_ZOOM));

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
    // Real number of events behind the cluster, not the number of merged groups: a member group
    // can itself already bundle several events sharing exact coordinates (see createGroupMarkerIcon).
    let totalEvents = 0;

    for (const { group, x, y } of members) {
      sumLat += group.latitude;
      sumLng += group.longitude;
      sumX += x;
      sumY += y;
      south = Math.min(south, group.latitude);
      north = Math.max(north, group.latitude);
      west = Math.min(west, group.longitude);
      east = Math.max(east, group.longitude);
      totalEvents += group.events.length;
    }

    const cx = sumX / members.length;
    const cy = sumY / members.length;
    if (cx < view.minX || cx > view.maxX || cy < view.minY || cy > view.maxY) continue;

    const lat = sumLat / members.length;
    const lng = sumLng / members.length;
    const bounds = { south, west, north, east };

    // These members are too close together to ever separate, even at the map's deepest zoom:
    // merge them into one marker (like a single group with several events) instead of a cluster
    // bubble that would never actually be able to split on zoom or click.
    if (projectedSpan(bounds) < MIN_CELL_SIZE) {
      const mergedId = members
        .map((member) => member.group.id)
        .sort()
        .join('+');
      items.push({
        kind: 'point',
        key: `p:merged:${mergedId}`,
        lat,
        lng,
        group: {
          id: `merged:${mergedId}`,
          latitude: lat,
          longitude: lng,
          events: members.flatMap((member) => member.group.events),
        },
      });
      continue;
    }

    items.push({
      kind: 'cluster',
      key: `c:${zoom}:${cellKey}`,
      lat,
      lng,
      count: totalEvents,
      bounds,
    });
  }

  return items;
}

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { EventGroup, EventItem } from '../../../types/event';
import { createGroupMarkerIcon, createClusterIcon, setMarkerHovered } from './CustomIcons';
import {
  clusterViewport,
  getViewRange,
  toClusterPoints,
  type ClusterBounds,
  type ClusterItem,
  type ClusterPoint,
} from '../utils/gridCluster';

interface ClusterLayerProps {
  eventGroups: EventGroup[];
  activeGroupId: string | null;
  onMarkerClick: (id: string) => void;
  onGroupClick: (events: EventItem[]) => void;
  onMarkerHover: (groupId: string, e: L.LeafletMouseEvent) => void;
  onMarkerLeave: () => void;
}

interface MarkerEntry {
  marker: L.Marker;
  kind: ClusterItem['kind'];
  // Changes when the icon has to change (event count / cluster size)
  signature: number;
  group?: EventGroup;
  bounds?: ClusterBounds;
}

// Former markercluster `maxClusterRadius` values. A marker joins a cluster if it is within this
// radius of its centre, so a cluster spans up to twice that: the grid cell is the diameter.
const getClusterRadius = (zoom: number) => {
  if (zoom <= 13) return 90;
  if (zoom <= 16) return 70;
  if (zoom <= 18) return 50;
  return 40;
};

const getCellSize = (zoom: number) => getClusterRadius(zoom) * 2;

// Fraction of the viewport also rendered around it, so panning doesn't reveal empty edges.
const VIEW_PADDING = 0.25;

/*
 * Imperative marker layer: everything is clustered in memory and only the clusters/pins inside
 * the viewport exist in the DOM. Markers are kept between renders and diffed by key, so a
 * category change or a pan only touches the markers that actually differ.
 */
export function ClusterLayer({
  eventGroups,
  activeGroupId,
  onMarkerClick,
  onGroupClick,
  onMarkerHover,
  onMarkerLeave,
}: ClusterLayerProps) {
  const map = useMap();

  const pointsRef = useRef<ClusterPoint[]>([]);
  const entriesRef = useRef(new Map<string, MarkerEntry>());
  const layerRef = useRef<L.LayerGroup | null>(null);
  const activeGroupIdRef = useRef<string | null>(null);
  const renderRef = useRef<() => void>(() => {});
  const hoveredEntryRef = useRef<MarkerEntry | null>(null);

  // Handlers are read at event time so the layer never has to be rebuilt when they change.
  const handlersRef = useRef({
    onMarkerClick,
    onGroupClick,
    onMarkerHover,
    onMarkerLeave,
  });
  useEffect(() => {
    handlersRef.current = { onMarkerClick, onGroupClick, onMarkerHover, onMarkerLeave };
  });

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    const entries = entriesRef.current;
    layerRef.current = layer;

    const createEntry = (item: ClusterItem): MarkerEntry => {
      const marker = L.marker([item.lat, item.lng], {
        icon:
          item.kind === 'cluster'
            ? createClusterIcon(item.count, item.key, { isNew: true })
            : createGroupMarkerIcon(item.group.events.length, false, true),
      });

      const entry: MarkerEntry = {
        marker,
        kind: item.kind,
        signature: item.kind === 'cluster' ? item.count : item.group.events.length,
        group: item.kind === 'point' ? item.group : undefined,
        bounds: item.kind === 'cluster' ? item.bounds : undefined,
      };

      if (item.kind === 'cluster') {
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          const { south, west, north, east } = entry.bounds!;
          map.fitBounds(
            [
              [south, west],
              [north, east],
            ],
            { padding: [60, 60], maxZoom: map.getMaxZoom() }
          );
        });
      } else {
        marker.on('click', (e) => {
          if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
          const events = entry.group?.events;
          if (!events?.length) return;
          // A group holds several events: list them all instead of opening only the first
          if (events.length > 1) handlersRef.current.onGroupClick(events);
          else handlersRef.current.onMarkerClick(events[0].id);
        });
        marker.on('mouseover', (e) => {
          if (entry.group) handlersRef.current.onMarkerHover(entry.group.id, e);
        });
        marker.on('mouseout', () => handlersRef.current.onMarkerLeave());
      }

      return entry;
    };

    const render = () => {
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) return;

      const zoom = map.getZoom();
      const view = getViewRange(map.getBounds().pad(VIEW_PADDING));
      const items = clusterViewport(pointsRef.current, view, zoom, getCellSize(zoom));
      const nextKeys = new Set<string>();

      for (const item of items) {
        nextKeys.add(item.key);
        const existing = entries.get(item.key);
        const signature = item.kind === 'cluster' ? item.count : item.group.events.length;

        if (!existing) {
          const entry = createEntry(item);
          entries.set(item.key, entry);
          layer.addLayer(entry.marker);
          continue;
        }

        existing.group = item.kind === 'point' ? item.group : existing.group;
        existing.bounds = item.kind === 'cluster' ? item.bounds : existing.bounds;

        if (existing.signature !== signature) {
          existing.signature = signature;
          existing.marker.setIcon(
            item.kind === 'cluster'
              ? createClusterIcon(item.count, item.key, { isCountUpdated: true })
              : createGroupMarkerIcon(signature)
          );
          existing.marker.setLatLng([item.lat, item.lng]);
        }
      }

      for (const [key, entry] of entries) {
        if (nextKeys.has(key)) continue;
        if (hoveredEntryRef.current === entry) hoveredEntryRef.current = null;
        layer.removeLayer(entry.marker);
        entries.delete(key);
      }

      applyHover();
    };

    const applyHover = () => {
      const activeId = activeGroupIdRef.current;
      const previous = hoveredEntryRef.current;
      const next = activeId
        ? ([...entries.values()].find((entry) => entry.group?.id === activeId) ?? null)
        : null;

      if (previous === next) return;
      if (previous) setMarkerHovered(previous.marker, false);
      if (next) setMarkerHovered(next.marker, true);
      hoveredEntryRef.current = next;
    };

    renderRef.current = render;
    map.on('moveend zoomend resize', render);
    render();

    return () => {
      map.off('moveend zoomend resize', render);
      renderRef.current = () => {};
      layer.remove();
      layerRef.current = null;
      entries.clear();
      hoveredEntryRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    pointsRef.current = toClusterPoints(eventGroups);
    renderRef.current();
  }, [eventGroups]);

  useEffect(() => {
    activeGroupIdRef.current = activeGroupId;
    const previous = hoveredEntryRef.current;
    if (previous) setMarkerHovered(previous.marker, false);
    hoveredEntryRef.current = null;

    if (!activeGroupId) return;
    for (const entry of entriesRef.current.values()) {
      if (entry.group?.id === activeGroupId) {
        setMarkerHovered(entry.marker, true);
        hoveredEntryRef.current = entry;
        break;
      }
    }
  }, [activeGroupId]);

  return null;
}

import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import type { EventGroup } from '../../../types/event';

interface MapEventsProps {
  activeGroup: EventGroup | null;
  setActiveGroupId: (id: string | null) => void;
  setHoverPos: (pos: { x: number; y: number } | null) => void;
}

export function MapEventsHandler({ activeGroup, setActiveGroupId, setHoverPos }: MapEventsProps) {
  const map = useMap();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Instantly hide preview positioning when map panning starts
    const handleDragStart = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setHoverPos(null);
    };

    // Clear active group on zoom change only (Do NOT handle map 'click' here!)
    const handleZoomStart = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setActiveGroupId(null);
      setHoverPos(null);
    };

    map.on('dragstart movestart', handleDragStart);
    map.on('zoomstart', handleZoomStart);

    return () => {
      map.off('dragstart movestart', handleDragStart);
      map.off('zoomstart', handleZoomStart);
    };
  }, [map, setActiveGroupId, setHoverPos]);

  useEffect(() => {
    if (!activeGroup) {
      setHoverPos(null);
      return;
    }

    const updatePosition = () => {
      // Skip updates while user is physically dragging
      if (map.dragging && map.dragging.moving()) {
        setHoverPos(null);
        return;
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const containerPoint = map.latLngToContainerPoint([
          activeGroup.latitude,
          activeGroup.longitude,
        ]);

        const size = map.getSize();
        // Prevent floating preview if marker panned off-screen
        if (
          containerPoint.x < 0 ||
          containerPoint.y < 0 ||
          containerPoint.x > size.x ||
          containerPoint.y > size.y
        ) {
          setHoverPos(null);
          return;
        }

        setHoverPos({ x: containerPoint.x, y: containerPoint.y });
      });
    };

    updatePosition();

    map.on('move zoom dragend', updatePosition);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off('move zoom dragend', updatePosition);
    };
  }, [map, activeGroup, setHoverPos]);

  return null;
}
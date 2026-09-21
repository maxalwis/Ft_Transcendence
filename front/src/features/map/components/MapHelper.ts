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
  const isDraggingRef = useRef(false);

  useEffect(() => {
    // Instantly hide preview positioning when map dragging starts
    const handleDragStart = () => {
      isDraggingRef.current = true;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setHoverPos(null);
    };

    // Allow preview positioning again when dragging ends
    const handleDragEnd = () => {
      isDraggingRef.current = false;
    };

    // Hide preview when the map starts moving for another reason
    const handleMoveStart = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setHoverPos(null);
    };

    // Clear active group on zoom change
    const handleZoomStart = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setActiveGroupId(null);
      setHoverPos(null);
    };

    map.on('dragstart', handleDragStart);
    map.on('dragend', handleDragEnd);
    map.on('movestart', handleMoveStart);
    map.on('zoomstart', handleZoomStart);

    return () => {
      map.off('dragstart', handleDragStart);
      map.off('dragend', handleDragEnd);
      map.off('movestart', handleMoveStart);
      map.off('zoomstart', handleZoomStart);
    };
  }, [map, setActiveGroupId, setHoverPos]);

  useEffect(() => {
    if (!activeGroup) {
      setHoverPos(null);
      return;
    }

    const updatePosition = () => {
      // Skip updates while the user is physically dragging
      if (isDraggingRef.current) {
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

        // Prevent floating preview if marker is panned off-screen
        if (
          containerPoint.x < 0 ||
          containerPoint.y < 0 ||
          containerPoint.x > size.x ||
          containerPoint.y > size.y
        ) {
          setHoverPos(null);
          return;
        }

        setHoverPos({
          x: containerPoint.x,
          y: containerPoint.y,
        });
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

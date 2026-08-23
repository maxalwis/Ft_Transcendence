import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { EventGroup } from './Map';

interface MapEventsProps {
  activeGroup: EventGroup | null;
  setHoverPos: (pos: { x: number; y: number } | null) => void;
}

export function MapEventsHandler({ activeGroup, setHoverPos }: MapEventsProps) {
  const map = useMap();

  useEffect(() => {
    if (!activeGroup) {
      setHoverPos(null);
      return;
    }

    const updatePosition = () => {
      const containerPoint = map.latLngToContainerPoint([
        activeGroup.latitude,
        activeGroup.longitude,
      ]);
      setHoverPos({ x: containerPoint.x, y: containerPoint.y });
    };

    updatePosition();

    // Re-calculate pixel anchor on map pan and zoom
    map.on('move zoom', updatePosition);
    return () => {
      map.off('move zoom', updatePosition);
    };
  }, [map, activeGroup, setHoverPos]);

  return null;
}

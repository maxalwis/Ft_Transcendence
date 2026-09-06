import { memo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { createMarkerIcon } from './CustomIcons.tsx';
import type { EventItem } from '../../../types/event';

interface EventMarkerProps {
  event: EventItem;
  isHovered: boolean;
  onClick: () => void;
  onHover: (e: L.LeafletMouseEvent) => void;
  onLeave: () => void;
}

export const EventMarker = memo(function EventMarker({
  event,
  isHovered,
  onClick,
  onHover,
  onLeave,
}: EventMarkerProps) {
  return (
    <Marker
      position={[Number(event.latitude), Number(event.longitude)]}
      icon={createMarkerIcon(isHovered, event.isNew)}
      eventHandlers={{
        click: onClick,
        mouseover: onHover,
        mouseout: onLeave,
      }}
    />
  );
});

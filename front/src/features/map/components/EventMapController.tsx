import { useEffect } from 'react';
import type { EventItem } from '../../../types/event';
import { useMap } from 'react-leaflet';

export function EventMapController({
  eventId,
  events,
}: {
  eventId: string | null;
  events: EventItem[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!eventId) return;

    const event = events.find((event) => event.id === eventId);

    if (!event) return;

    const latitude = Number(event.latitude);
    const longitude = Number(event.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    map.flyTo([latitude, longitude], 16, {
      duration: 0.8,
    });
  }, [eventId, events, map]);

  return null;
}
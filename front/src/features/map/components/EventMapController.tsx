import { useEffect } from 'react';
import type { EventItem } from '../../../types/event';
import { useMap } from 'react-leaflet';
import { DEFAULT_ZOOM } from '../../../types/constants';

export function EventMapController({
  eventId,
  events,
}: {
  eventId: string | null;
  events: EventItem[];
}) {
  const map = useMap();

  useEffect(() => {
    // No event selected → zoom back out
    if (!eventId) {
      map.flyTo(map.getCenter(), DEFAULT_ZOOM, {
        duration: 0.8,
      });
      return;
    }

    const event = events.find((event) => event.id === eventId);

    if (!event) return;

    const latitude = Number(event.latitude);
    const longitude = Number(event.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    // Map flyTo with a duration of 0.8 seconds to the event's coordinates at zoom level 16
    map.flyTo([latitude, longitude], 16, {
      duration: 0.8,
    });
  }, [eventId, events, map]);

  return null;
}

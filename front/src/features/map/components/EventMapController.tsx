import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { EventItem } from '../../../types/event';
import { useMap } from 'react-leaflet';
import { DEFAULT_ZOOM } from '../../../types/constants';

// When leaving an event, zoom out to DEFAULT_ZOOM + this instead of the full default view
const ZOOM_OUT_OFFSET = 2;
// Minimum zoom when focusing a selected event. Never zoomed out below this to reach it.
const EVENT_FOCUS_ZOOM = 16;

export function EventMapController({
  eventId,
  events,
  skipZoomClearRef,
}: {
  eventId: string | null;
  events: EventItem[];
  skipZoomClearRef?: RefObject<boolean>;
}) {
  const map = useMap();
  // Latest events without making the effect re-run when results change (filters, refetch)
  const eventsRef = useRef(events);
  const previousEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const previousEventId = previousEventIdRef.current;
    previousEventIdRef.current = eventId;

    // Event deselected → gentle zoom out (only if we were actually zoomed on it)
    if (!eventId) {
      if (previousEventId) {
        const targetZoom = Math.min(map.getZoom(), DEFAULT_ZOOM + ZOOM_OUT_OFFSET);
        map.flyTo(map.getCenter(), targetZoom, {
          duration: 0.8,
        });
      }
      return;
    }

    const event = eventsRef.current.find((event) => event.id === eventId);

    if (!event) return;

    const latitude = Number(event.latitude);
    const longitude = Number(event.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    // Fly to the event's coordinates, only zooming in: if the user is already zoomed in further
    // (e.g. manually separated a tight cluster), selecting one of its events must not zoom back
    // out and reassemble the cluster underneath them.
    const targetZoom = Math.max(map.getZoom(), EVENT_FOCUS_ZOOM);

    // This flyTo can trigger a 'zoomstart' event, which MapEventsHandler otherwise treats as a
    // user-driven zoom and uses to clear the active marker group / hover preview. Suppress that
    // while this programmatic flight is in progress.
    if (skipZoomClearRef) {
      skipZoomClearRef.current = true;
      map.once('moveend', () => {
        skipZoomClearRef.current = false;
      });
    }

    map.flyTo([latitude, longitude], targetZoom, {
      duration: 0.8,
    });
  }, [eventId, map, skipZoomClearRef]);

  return null;
}

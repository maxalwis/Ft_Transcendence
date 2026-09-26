import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EventItem, EventGroup } from '../../../types/event';
import { useTranslation } from 'react-i18next';

interface RawEventItem extends Partial<EventItem> {
  latitude: number | string;
  longitude: number | string;
  date_start?: string;
  date_end?: string;
  price_type?: string;
  access_link?: string;
}

// Same filters => same response: switching back and forth between categories is instant, and a
// page reload paints the last dataset immediately while a fresh copy is fetched in the background.
const CACHE_TTL_MS = 60_000;
const MAX_CACHED_QUERIES = 12;
const STORAGE_KEY = 'mapEvents:last';

interface CacheEntry {
  ts: number;
  text: string;
  data: EventItem[];
}

const memoryCache = new Map<string, CacheEntry>();

const normalizeEvents = (rawData: RawEventItem[]): EventItem[] =>
  rawData.map((event) => ({
    ...(event as EventItem),
    latitude: Number(event.latitude),
    longitude: Number(event.longitude),
    dateStart: event.dateStart ?? event.date_start ?? '',
    dateEnd: event.dateEnd ?? event.date_end,
    priceType: event.priceType ?? event.price_type,
    accessLink: event.accessLink ?? event.access_link,
  }));

function readCache(url: string): CacheEntry | null {
  const cached = memoryCache.get(url);
  if (cached) return cached;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { url: string; ts: number; text: string };
    if (parsed.url !== url) return null;
    const entry = {
      ts: parsed.ts,
      text: parsed.text,
      data: normalizeEvents(JSON.parse(parsed.text) as RawEventItem[]),
    };
    memoryCache.set(url, entry);
    return entry;
  } catch {
    return null;
  }
}

function writeCache(url: string, entry: CacheEntry) {
  memoryCache.delete(url);
  memoryCache.set(url, entry);
  if (memoryCache.size > MAX_CACHED_QUERIES) {
    memoryCache.delete(memoryCache.keys().next().value as string);
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ url, ts: entry.ts, text: entry.text }));
  } catch {
    // Quota exceeded or storage unavailable: the in-memory cache is enough.
  }
}

export function useMapEvents(
  showWarning: (msg: string) => void,
  filters?: {
    city?: string;
    startDate?: string;
    endDate?: string;
    priceType?: string;
    category?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
  }
) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);

  const { t } = useTranslation();

  // showWarning and t change identity on every language switch. The map data doesn't depend on the
  // language, so they are read through refs instead of being effect dependencies.
  const showWarningRef = useRef(showWarning);
  const tRef = useRef(t);
  useEffect(() => {
    showWarningRef.current = showWarning;
    tRef.current = t;
  });

  const city = filters?.city ?? 'Paris';
  const startDate = filters?.startDate ?? '';
  const endDate = filters?.endDate ?? '';
  const priceType = filters?.priceType ?? '';
  const category = filters?.category ?? '';
  const minPrice = filters?.minPrice ?? '';
  const maxPrice = filters?.maxPrice ?? '';

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (startDate) params.append('from', startDate);
    if (endDate) params.append('to', endDate);
    if (priceType) params.append('price', priceType);
    if (category.trim() !== '') params.append('category', category.trim());
    if (minPrice !== '') params.append('minPrice', String(minPrice));
    if (maxPrice !== '') params.append('maxPrice', String(maxPrice));

    const envUrl = import.meta.env?.VITE_API_URL;
    const queryString = params.toString();
    const queryPath = queryString ? `?${queryString}` : '';

    if (!envUrl) return `/api/events/map${queryPath}`;

    const cleanBase = envUrl.replace(/\/+$/, '');
    return cleanBase.endsWith('/api')
      ? `${cleanBase}/events/map${queryPath}`
      : `${cleanBase}/api/events/map${queryPath}`;
  }, [city, startDate, endDate, priceType, category, minPrice, maxPrice]);

  useEffect(() => {
    const controller = new AbortController();

    const cached = readCache(url);
    if (cached) {
      // Cache hit: show it immediately, before the background revalidation below.
      /* eslint-disable react-hooks/set-state-in-effect */
      setEvents(cached.data);
      setIsLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      if (Date.now() - cached.ts < CACHE_TTL_MS) return;
    } else {
      // Previous events stay on the map while the new ones load: no blank flash between filters.
      setIsLoading(true);
    }

    const fetchEvents = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            message?: string | string[];
          };
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || `Error ${response.status}: Failed to load map events`;

          throw new Error(message);
        }

        const text = await response.text();

        if (cached && cached.text === text) {
          // Unchanged since the cached copy: nothing to re-render.
          writeCache(url, { ...cached, ts: Date.now() });
          return;
        }

        const data = normalizeEvents(JSON.parse(text) as RawEventItem[]);
        writeCache(url, { ts: Date.now(), text, data });
        setEvents(data);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch map events:', err);
        showWarningRef.current(
          err instanceof Error
            ? err.message
            : tRef.current(
                'events.errors.loadFailed',
                'An error occurred while loading map events.'
              )
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchEvents();

    return () => controller.abort();
  }, [url]);

  const eventGroups = useMemo<EventGroup[]>(() => {
    const groupsMap = new Map<string, EventItem[]>();

    events.forEach((event) => {
      if (
        event.latitude == null ||
        event.longitude == null ||
        isNaN(Number(event.latitude)) ||
        isNaN(Number(event.longitude))
      ) {
        return;
      }

      const lat = Number(event.latitude);
      const lng = Number(event.longitude);
      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(event);
    });

    return Array.from(groupsMap.entries()).map(([key, groupEvents]) => ({
      id: key,
      latitude: Number(groupEvents[0].latitude),
      longitude: Number(groupEvents[0].longitude),
      events: groupEvents,
    }));
  }, [events]);

  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return eventGroups.find((g) => g.id === activeGroupId) || null;
  }, [eventGroups, activeGroupId]);

  const currentEvent = useMemo(() => {
    if (!activeGroup) return null;
    return activeGroup.events[activeEventIndex] || activeGroup.events[0];
  }, [activeGroup, activeEventIndex]);

  const handlePrevEvent = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveEventIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNextEvent = useCallback((e?: React.MouseEvent, maxIndex = 0) => {
    e?.stopPropagation();
    setActiveEventIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  }, []);

  return {
    events,
    isLoading,
    eventGroups,
    activeGroup,
    currentEvent,
    activeGroupId,
    activeEventIndex,
    setActiveGroupId,
    setActiveEventIndex,
    handlePrevEvent,
    handleNextEvent,
  };
}

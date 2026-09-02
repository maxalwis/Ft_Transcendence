import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EventItem, EventGroup } from '../../../types/event';

export function useMapEvents(
  showError: (msg: string) => void,
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

  // 1. Deconstruct primitive values explicitly to give useEffect stable dependency keys
  const city = filters?.city ?? 'Paris';
  const startDate = filters?.startDate ?? '';
  const endDate = filters?.endDate ?? '';
  const priceType = filters?.priceType ?? '';
  const category = filters?.category ?? '';
  const minPrice = filters?.minPrice ?? '';
  const maxPrice = filters?.maxPrice ?? '';

  useEffect(() => {
    const fetchAllEvents = async () => {

      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (startDate) params.append('from', startDate);
        if (endDate) params.append('to', endDate);
        if (priceType) params.append('price', priceType);
        
        if (category && category.trim() !== '') {
          params.append('category', category.trim());
        }

        if (minPrice !== '') params.append('minPrice', String(minPrice));
        if (maxPrice !== '') params.append('maxPrice', String(maxPrice));

        const envUrl = (import.meta as any).env?.VITE_API_URL;
        const queryString = params.toString();
        const queryPath = queryString ? `?${queryString}` : '';

        let url = '';
        if (envUrl) {
          const cleanBase = envUrl.replace(/\/+$/, '');
          url = cleanBase.endsWith('/api')
            ? `${cleanBase}/events/map${queryPath}`
            : `${cleanBase}/api/events/map${queryPath}`;
        } else {
          url = `/api/events/map${queryPath}`;
        }

        params.append('_t', Date.now().toString());

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || `Error ${response.status}: Failed to load map events`;

          throw new Error(message);
        }

        const rawData = await response.json();

        const data: EventItem[] = rawData.map((event: any) => ({
          ...event,
          latitude: Number(event.latitude),
          longitude: Number(event.longitude),
          dateStart: event.dateStart ?? event.date_start,
          dateEnd: event.dateEnd ?? event.date_end,
          priceType: event.priceType ?? event.price_type,
          accessLink: event.accessLink ?? event.access_link,
        }));

        setEvents(data);
      } catch (err: unknown) {
        console.error('Failed to fetch map events:', err);
        showError(
          err instanceof Error ? err.message : 'An error occurred while loading map events.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
    // 2. Pass individual primitive string dependencies to ensure reactivity
  }, [showError, city, startDate, endDate, priceType, category, minPrice, maxPrice]);

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
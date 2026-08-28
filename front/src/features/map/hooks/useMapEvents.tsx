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

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setIsLoading(true);
        
        // Utilisation sécurisée de l'URL de base
        const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
        
        const params = new URLSearchParams();
        if (filters?.city) params.append('city', filters.city);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.priceType) params.append('price', filters.priceType);
        if (filters?.category) params.append('category', filters.category);
        
        // Ajout des paramètres de prix min et max pour qu'ils soient transmis au backend
        if (filters?.minPrice !== undefined && filters?.minPrice !== '') {
          params.append('minPrice', String(filters.minPrice));
        }
        if (filters?.maxPrice !== undefined && filters?.maxPrice !== '') {
          params.append('maxPrice', String(filters.maxPrice));
        }

        const queryString = params.toString();
        const url = `${baseUrl}/events/map${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || `Error ${response.status}: Failed to load map events`;

          throw new Error(message);
        }

        const rawData: Array<
          EventItem & {
            date_start?: string;
            date_end?: string;
            price_type?: string;
            access_link?: string;
          }
        > = await response.json();
        const data: EventItem[] = rawData.map((event) => ({
          ...event,
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
  }, [showError, filters]);

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
      latitude: groupEvents[0].latitude,
      longitude: groupEvents[0].longitude,
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

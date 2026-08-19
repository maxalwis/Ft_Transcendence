import { MapContainer } from 'react-leaflet';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import MySidebar from '../Sidebar/Sidebar';
import { EventsDetails } from './EventsDetails.tsx';
import Friends from '../Friends/Friends.tsx';
import { useNotification } from '../Context/NotificationContext.tsx';

import { ClusterLayer } from './ClusterLayer.tsx';
import { MyTileLayer, MapClickHandler, GlassZoomControl } from './MapControls.tsx';
import type { EventItem } from '../types/event';
import './Map.css';
import NavBar from '../NavBar/NavBar.tsx';
import Filters from '../Filters/Filters.tsx';
import BottomBar from '../BottomBar/BottomBar.tsx';


import { MapEventsHandler } from './MapHelper.tsx';

const idfBounds = new L.LatLngBounds([48.65, 1.95], [49.05, 2.75]);

export interface EventGroup {
  id: string; // Unique spatial key
  latitude: number;
  longitude: number;
  events: EventItem[];
}

// Interface pour typer vos events si ce n'est pas déjà fait ailleurs
interface EventItem {
  id: string;
  latitude: number;
  longitude: number;
  isNew?: boolean;
  title: string;
  category?: string;
  dateEnd?: string;
  interestedUsersCount?: number;
  coverUrl?: string;
}

export default function MyMap() {
  const [activeSidebarEventId, setActiveSidebarEventId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // État local pour stocker les filtres actifs
  const [filters, setFilters] = useState({
    city: 'Paris',
    startDate: '',
    endDate: '',
    priceType: '',
  });

  const { showError } = useNotification();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);

  const fetchEventsForBbox = useCallback(
    async (bounds: L.LatLngBounds) => {
      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // Truncate coordinates to 3 decimal places
        const swLng = sw.lng.toFixed(3);
        const swLat = sw.lat.toFixed(3);
        const neLng = ne.lng.toFixed(3);
        const neLat = ne.lat.toFixed(3);

        const bboxString = `${swLng},${swLat},${neLng},${neLat}`;

        // Construction dynamique des paramètres de l'URL avec les filtres
        const params = new URLSearchParams({
          bbox: bboxString,
          ...(filters.startDate && { from: filters.startDate }),
          ...(filters.endDate && { to: filters.endDate }),
          ...(filters.priceType && { priceType: filters.priceType }),
        });

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/events/map?${params.toString()}`);

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch map events:', err);
      }
    },
    [filters] // Dépendance sur 'filters' pour refetcher automatiquement quand ils changent
  );
  // 1. Group raw events by spatial location
  const eventGroups = useMemo(() => {
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

  // 2. Active spatial group
  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return eventGroups.find((g) => g.id === activeGroupId) || null;
  }, [eventGroups, activeGroupId]);

  // 3. Current event inside carousel
  const currentEvent = useMemo(() => {
    if (!activeGroup) return null;
    return activeGroup.events[activeEventIndex] || activeGroup.events[0];
  }, [activeGroup, activeEventIndex]);

  // Navigation Handlers
  const handlePrevEvent = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveEventIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNextEvent = useCallback((e?: React.MouseEvent, maxIndex = 0) => {
    e?.stopPropagation();
    setActiveEventIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  }, []);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/events/map`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || `Error ${response.status}: Failed to load map events`;

          throw new Error(message);
        }

        const data: EventItem[] = await response.json();
        setEvents(data);
      } catch (err: any) {
        console.error('Failed to fetch map events:', err);
        showError(err.message || 'An error occurred while loading map events.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
  }, [showError]);

  const cancelCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = useCallback(() => {
    cancelCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveGroupId(null);
      setActiveEventIndex(0);
      setHoverPos(null);
    }, 150);
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    cancelCloseTimeout();
    setActiveSidebarEventId(id);
    setActiveGroupId(null);
    setHoverPos(null);
  }, []);

  // Set active group; MapEventsHandler will compute hoverPos inside <MapContainer>
  const handleMarkerHover = useCallback((groupId: string) => {
    cancelCloseTimeout();
    setActiveGroupId(groupId);
  }, []);

  return (
    <>
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={12}
        minZoom={12}
        scrollWheelZoom={true}
        maxBounds={idfBounds}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        style={{ height: '100vh', width: '100vw' }}
      >
        <MapClickHandler closeSidebar={() => setActiveSidebarEventId(null)} />
        <MyTileLayer />
        <GlassZoomControl />

        {/* Syncs container pixel position for hoverPos on hover, pan, and zoom */}
        <MapEventsHandler activeGroup={activeGroup} setHoverPos={setHoverPos} />

        {!isLoading && (
          <ClusterLayer
            eventGroups={eventGroups}
            activeGroupId={activeGroupId}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={(groupId) => handleMarkerHover(groupId)}
            onMarkerLeave={handleMouseLeave}
          />
        )}
      </MapContainer>

      {/* Floating Popup Overlay */}
      {currentEvent && activeGroup && hoverPos && (
        <EventsDetails
          position={hoverPos}
          title={currentEvent.title}
          category={currentEvent.category?.[0] || 'Event'}
          isOpen={true}
          closingTime={
            currentEvent.dateEnd
              ? new Date(currentEvent.dateEnd).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '11:00 PM'
          }
          interestedUsersCount={currentEvent.interestedUsersCount || 0}
          imageUrl={currentEvent.coverUrl}
          totalInGroup={activeGroup.events.length}
          currentIndex={activeEventIndex}
          onPrev={handlePrevEvent}
          onNext={(e) => handleNextEvent(e, activeGroup.events.length - 1)}
          onClick={() => setActiveSidebarEventId(currentEvent.id)}
          onMouseEnter={cancelCloseTimeout}
          onMouseLeave={handleMouseLeave}
        />
      )}

      <Friends />
      {/* On transmet la fonction de mise à jour au composant Filters */}
      <Filters onApplyFilters={(newFilters) => setFilters(newFilters)} />
      <NavBar />
      <BottomBar />

      {activeSidebarEventId && (
        <MySidebar
          eventId={activeSidebarEventId}
          currentUserId={1}
          onClose={() => {
            setActiveSidebarEventId(null);
            setHoverPos(null);
          }}
        />
      )}
    </>
  );
}
// External Libraries
import { useState, useRef, useCallback } from 'react';
import { MapContainer } from 'react-leaflet';

// Third-Party Styles
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// Layouts & Feature Components
import SideBar from '../../../layouts/Sidebar';
import NavBar from '../../../layouts/NavBar';
import BottomBar from '../../../layouts/BottomBar';
import Friends from '../../friends/components/Friends';
import Filters from './Filters';
import { EventsDetails } from './EventsDetails';
import { ClusterLayer } from './ClusterLayer';
import { MyTileLayer, MapClickHandler, GlassZoomControl } from '../MapControls';

// State Management, Hooks & Helpers
import { useNotification } from '../../../context/notifications/NotificationContext';
import { useMapEvents } from '../hooks/useMapEvents';
import { MapEventsHandler } from './MapHelper';
import { useAuth } from '../../../context/auth/AuthContext';

import { useLanguage } from '../../../context/language/LanguageContext';
import { useTranslatedEvent } from '../../events/hooks/useTranslatedEvent';

// Constants & Configuration
import { PARIS_CENTER, DEFAULT_ZOOM, IDF_BOUNDS } from '../Map.constants';

// Local Styles
import '../Map.module.css';

export default function Map() {
  const { showError } = useNotification();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [activeSidebarEventId, setActiveSidebarEventId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // État local pour stocker les filtres actifs
  const [filters, setFilters] = useState({
    city: 'Paris',
    startDate: '',
    endDate: '',
    priceType: '',
  });

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isLoading,
    events,
    eventGroups,
    activeGroup,
    currentEvent,
    activeGroupId,
    activeEventIndex,
    setActiveGroupId,
    setActiveEventIndex,
    handlePrevEvent,
    handleNextEvent,
  } = useMapEvents(showError);

  const { data: translatedHoverEvent, loading: hoverLoading } = useTranslatedEvent(
    currentEvent?.id ?? '',
    lang
  );
  const isHoverTranslating = lang !== 'fr' && hoverLoading && !translatedHoverEvent;
  const displayedHoverTitle = isHoverTranslating
    ? undefined
    : (translatedHoverEvent?.title ?? currentEvent?.title ?? '');

  const selectedSidebarEvent = activeSidebarEventId
    ? events.find((event) => event.id === activeSidebarEventId) || null
    : null;

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
  }, [setActiveGroupId, setActiveEventIndex]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      cancelCloseTimeout();
      setActiveSidebarEventId(id);
      setActiveGroupId(null);
      setHoverPos(null);
    },
    [setActiveGroupId]
  );

  const handleMarkerHover = useCallback(
    (groupId: string) => {
      cancelCloseTimeout();
      setActiveGroupId(groupId);
    },
    [setActiveGroupId]
  );

  return (
    <>
      <MapContainer
        center={PARIS_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        maxBounds={IDF_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        style={{ height: '100vh', width: '100vw' }}
      >
        <MapClickHandler closeSidebar={() => setActiveSidebarEventId(null)} />
        <MyTileLayer />
        <GlassZoomControl />

        <MapEventsHandler activeGroup={activeGroup} setHoverPos={setHoverPos} />

        {!isLoading && (
          <ClusterLayer
            eventGroups={eventGroups}
            activeGroupId={activeGroupId}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={handleMarkerHover}
            onMarkerLeave={handleMouseLeave}
          />
        )}
      </MapContainer>

      {currentEvent && activeGroup && hoverPos && (
        <EventsDetails
          position={hoverPos}
          eventId={currentEvent.id}
          title={displayedHoverTitle}
          isTranslating={isHoverTranslating}
          dateStart={currentEvent.dateStart}
          dateEnd={currentEvent.dateEnd}
          priceType={currentEvent.priceType}
          category={currentEvent.category?.[0] || 'Event'}
          isOpen={true}
          closingTime={
            currentEvent.dateEnd
              ? new Date(currentEvent.dateEnd).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Date inconnue'
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
      <Filters />
      <NavBar />
      <BottomBar />

      {activeSidebarEventId && (
        <SideBar
          eventId={activeSidebarEventId}
          currentUserId={user?.id}
          //   currentUserId={1}
          event={selectedSidebarEvent}
          onClose={() => {
            setActiveSidebarEventId(null);
            setHoverPos(null);
          }}
        />
      )}
    </>
  );
}

import { useState, useRef, useCallback } from 'react';
import { MapContainer } from 'react-leaflet';

// Third-Party Styles
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// Layouts & Feature Components
import LanguageSelector from '../../../layouts/LanguageSelector';
import BottomBar from '../../../layouts/BottomBar';
import Filters from './Filters';
import SideBar from '../../../layouts/Sidebar';
import NavBar from '../../../layouts/NavBar';

// Marker & Map Visual Components
import { MyTileLayer, MapClickHandler, GlassZoomControl } from '../MapControls';
import EventPreview from '../../events/components/EventPreview';
import EventSidebarContent from '../../events/components/EventSidebarContent';
import EventResultsSidebar from '../../events/components/EventResultsSidebar';
import { ClusterLayer } from './ClusterLayer';
import { AdminPanelLinks } from '../../externalLinks/AdminPanelLinks';

// State Management, Hooks & Helpers
import { useNotification } from '../../../context/notifications/useNotification';
import { useAuth } from '../../../context/auth/useAuth';
import { useMapEvents } from '../hooks/useMapEvents';
import { MapEventsHandler } from './MapHelper';

import { useTranslation } from 'react-i18next';
import { useTranslatedEvent } from '../../events/hooks/useTranslatedEvent';

// Constants & Configuration
import { PARIS_CENTER, DEFAULT_ZOOM, IDF_BOUNDS } from '../Map.constants';

// Local Styles
import '../Map.module.css';

interface MapProps {
  onOpenAuth: () => void;
}

type SidebarState =
  | { type: 'event'; eventId: string }
  | { type: 'results' }
  | null;

export default function Map({ onOpenAuth }: MapProps) {
  const { showError } = useNotification();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [sidebar, setSidebar] = useState<SidebarState>(null);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const [filters, setFilters] = useState<{
    city: string;
    startDate: string;
    endDate: string;
    priceType: string;
    category: string;
  }>({
    city: 'Paris',
    startDate: '',
    endDate: '',
    priceType: '',
    category: '',
  });

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
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
  } = useMapEvents(showError, filters);

  /*
   * eventGroups are grouped for the map.
   * The sidebar doesn't need those groups, so flatten them into
   * a simple array of events.
   */
  const events = eventGroups.flatMap((group) => group.events);

  const { data: translatedHoverEvent, loading: hoverLoading } =
    useTranslatedEvent(currentEvent?.id ?? '', lang);

  const isHoverTranslating =
    lang !== 'fr' && hoverLoading && !translatedHoverEvent;

  const displayedHoverTitle = isHoverTranslating
    ? undefined
    : (translatedHoverEvent?.title ?? currentEvent?.title ?? '');

  const displayedHoverCategory = isHoverTranslating
    ? undefined
    : (
        (translatedHoverEvent?.category as unknown as string[])?.[0] ??
        currentEvent?.category?.[0]
      );

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

  /*
   * Open the event detail sidebar.
   */
  const handleOpenSidebar = useCallback(
    (id: string) => {
      cancelCloseTimeout();

      setSidebar({
        type: 'event',
        eventId: id,
      });

      setActiveGroupId(null);
      setHoverPos(null);
    },
    [setActiveGroupId]
  );

  /*
   * Open the paginated results sidebar.
   */
  const handleOpenResults = useCallback(() => {
    cancelCloseTimeout();

    setSidebar({
      type: 'results',
    });

    setActiveGroupId(null);
    setHoverPos(null);
  }, [setActiveGroupId]);

  /*
   * Called by EventResultsSidebar when the user clicks
   * one of the events in the results list.
   *
   * This replaces the results content with the event details.
   */
  const handleResultsEventClick = useCallback((eventId: string) => {
    setSidebar({
      type: 'event',
      eventId,
    });

    setHoverPos(null);
  }, []);

  const handleMarkerHover = useCallback(
    (groupId: string) => {
      cancelCloseTimeout();
      setActiveGroupId(groupId);
    },
    [setActiveGroupId]
  );

  const handleSelectCategory = useCallback((selectedCategory: string) => {
    setFilters((prev) => {
      if (!selectedCategory || selectedCategory.trim() === '') {
        return {
          ...prev,
          category: '',
        };
      }

      const isAlreadyActive =
        prev.category.trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase();

      const nextCategory = isAlreadyActive ? '' : selectedCategory;

      return {
        ...prev,
        category: nextCategory,
      };
    });
  }, []);

  const handleApplyFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    },
    []
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
        <MapClickHandler
          closeSidebar={() => {
            setSidebar(null);
            setHoverPos(null);
          }}
        />

        <MyTileLayer />

        <GlassZoomControl />

        <AdminPanelLinks />

        <MapEventsHandler
          activeGroup={activeGroup}
          setActiveGroupId={setActiveGroupId}
          setHoverPos={setHoverPos}
        />

        {!isLoading && (
          <ClusterLayer
            eventGroups={eventGroups}
            activeGroupId={activeGroupId}
            onMarkerClick={handleOpenSidebar}
            onMarkerHover={handleMarkerHover}
            onMarkerLeave={handleMouseLeave}
          />
        )}
      </MapContainer>

      {currentEvent && activeGroup && hoverPos && (
        <EventPreview
          position={hoverPos}
          eventId={currentEvent.id}
          title={displayedHoverTitle}
          isTranslating={isHoverTranslating}
          priceType={currentEvent.priceType}
          dateStart={currentEvent.dateStart}
          dateEnd={currentEvent.dateEnd}
          category={displayedHoverCategory || 'Event'}
          isOpen={true}
          interestedUsersCount={currentEvent.interestedUsersCount || 0}
          imageUrl={currentEvent.coverUrl}
          totalInGroup={activeGroup.events.length}
          currentIndex={activeEventIndex}
          onPrev={handlePrevEvent}
          onNext={() =>
            handleNextEvent(undefined, activeGroup.events.length - 1)
          }
          onClick={() => handleOpenSidebar(currentEvent.id)}
          onMouseEnter={cancelCloseTimeout}
          onMouseLeave={handleMouseLeave}
        />
      )}

      <Filters onApplyFilters={handleApplyFilters} />

      <NavBar
        activeCategory={filters.category}
        onSelectCategory={handleSelectCategory}
        onOpenResults={handleOpenResults}
      />

      {!sidebar && <LanguageSelector />}

      <BottomBar onOpenAuth={onOpenAuth} />

      {sidebar !== null && (
        <SideBar
          onClose={() => {
            setSidebar(null);
            setHoverPos(null);
          }}
        >
          {sidebar.type === 'results' && (
            <EventResultsSidebar
              events={events}
              isLoading={isLoading}
              onEventClick={handleResultsEventClick}
            />
          )}

          {sidebar.type === 'event' && (
            <EventSidebarContent
              eventId={sidebar.eventId}
              currentUserId={user?.id}
            />
          )}
        </SideBar>
      )}
    </>
  );
}
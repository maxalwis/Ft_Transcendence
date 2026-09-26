import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

// Third-Party Styles
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// Layouts & Feature Components
import BottomBar from '../../../layouts/BottomBar';
import SideBar from '../../../layouts/Sidebar';
import NavBar from '../../../layouts/NavBar';

// Marker & Map Visual Components
import { MapClickHandler, GlassZoomControl } from '../MapControls';
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
import { PARIS_CENTER, DEFAULT_ZOOM, IDF_BOUNDS } from '../../../types/constants';

import { EventMapController } from './EventMapController';
import { mapPreferredCategory, mapPreferredLanguage } from '../utils/userPreferences';
// Local Styles
import '../Map.module.css';

type SidebarState = { type: 'event'; eventId: string } | { type: 'results' } | null;

export default function Map() {
  const { showWarning } = useNotification();
  const { user, justLoggedIn, clearJustLoggedIn } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [sidebar, setSidebar] = useState<SidebarState>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [resultsScrollTop, setResultsScrollTop] = useState(0);

  const [hoverPos, setHoverPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

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
  } = useMapEvents(showWarning, filters);

  const events = useMemo(() => eventGroups.flatMap((group) => group.events), [eventGroups]);

  const { data: translatedHoverEvent, loading: hoverLoading } = useTranslatedEvent(
    currentEvent?.id ?? '',
    lang
  );

  const isHoverTranslating = lang !== 'fr' && hoverLoading && !translatedHoverEvent;

  const displayedHoverTitle = isHoverTranslating
    ? undefined
    : (translatedHoverEvent?.title ?? currentEvent?.title ?? '');

  const displayedHoverCategory = isHoverTranslating
    ? undefined
    : ((translatedHoverEvent?.category as unknown as string[])?.[0] ?? currentEvent?.category?.[0]);

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

      setIsSidebarOpen(true);
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

    setIsSidebarOpen(true);
    setActiveGroupId(null);
    setHoverPos(null);
  }, [setActiveGroupId]);

  /*
   * Called when an event is selected from the results sidebar.
   * Replace the results sidebar with the selected event details.
   */
  const handleResultsEventClick = useCallback((eventId: string) => {
    setSidebar({
      type: 'event',
      eventId,
    });

    setIsSidebarOpen(true);
    setHoverPos(null);
  }, []);

  const handleMarkerHover = useCallback(
    (groupId: string) => {
      cancelCloseTimeout();
      setActiveGroupId(groupId);
    },
    [setActiveGroupId]
  );

  /*
   * Category filter handler.
   */
  const handleSelectCategory = useCallback((selectedCategory: string) => {
    setCurrentResultsPage(1);
    setResultsScrollTop(0);

    setFilters((prev) => {
      if (!selectedCategory || selectedCategory.trim() === '') {
        return {
          ...prev,
          category: '',
        };
      }

      const isAlreadyActive =
        prev.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      const nextCategory = isAlreadyActive ? '' : selectedCategory;

      return {
        ...prev,
        category: nextCategory,
      };
    });
  }, []);

  /*
   * Price filter handler.
   */
  const handlePriceChange = useCallback((priceType: string) => {
    setCurrentResultsPage(1);
    setResultsScrollTop(0);

    setFilters((prev) => ({
      ...prev,
      priceType,
    }));
  }, []);

  /*
   * Date filter handler.
   */
  const handleDateChange = useCallback((startDate: string) => {
    setCurrentResultsPage(1);
    setResultsScrollTop(0);

    setFilters((prev) => ({
      ...prev,
      startDate,
    }));
  }, []);

  /*
   * Apply preferredLanguage / preferredCategory once, right after a real login.
   * Excludes silent session restores on page refresh (justLoggedIn stays false then).
   */
  useEffect(() => {
    if (!justLoggedIn || !user) return;

    const preferredLanguage = mapPreferredLanguage(user.preferredLanguage);
    if (preferredLanguage) {
      i18n.changeLanguage(preferredLanguage);
    }

    const preferredCategory = mapPreferredCategory(user.preferredCategory);
    if (preferredCategory) {
      setCurrentResultsPage(1);
      setResultsScrollTop(0);
      setFilters((prev) => ({ ...prev, category: preferredCategory }));
    }

    clearJustLoggedIn();
  }, [justLoggedIn, user, i18n, clearJustLoggedIn]);

  return (
    <>
      <MapContainer
        center={PARIS_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={DEFAULT_ZOOM}
        scrollWheelZoom
        maxBounds={IDF_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        className="h-full w-full"
      >
        <EventMapController
          eventId={sidebar?.type === 'event' ? sidebar.eventId : null}
          events={events}
        />
        <MapClickHandler
          closeSidebar={() => {
            setIsSidebarOpen(false);
            setHoverPos(null);
          }}
        />

        <TileLayer
          attribution='&copy; <a href="https://jawg.io">JawgMaps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="/api/tiles/{z}/{x}/{y}{r}.png"
          bounds={IDF_BOUNDS}
          keepBuffer={0}
        />

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

      {/* Event preview shown when hovering a marker group */}
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
          onNext={() => handleNextEvent(undefined, activeGroup.events.length - 1)}
          onClick={() => handleOpenSidebar(currentEvent.id)}
          onMouseEnter={cancelCloseTimeout}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Navigation and category filters */}
      <NavBar
        activeCategory={filters.category}
        onSelectCategory={handleSelectCategory}
        onOpenResults={handleOpenResults}
        priceType={filters.priceType}
        onPriceChange={handlePriceChange}
        startDate={filters.startDate}
        onDateChange={handleDateChange}
      />

      <BottomBar />

      {/* Sidebar */}
      {sidebar !== null && (
        <SideBar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onClose={() => {
            setSidebar(null);
            setHoverPos(null);
          }}
          onBack={
            sidebar.type === 'event'
              ? () => {
                  setSidebar({ type: 'results' });
                  setIsSidebarOpen(true);
                  setHoverPos(null);
                }
              : undefined
          }
        >
          {sidebar.type === 'results' && (
            <EventResultsSidebar
              events={events}
              isLoading={isLoading}
              currentPage={currentResultsPage}
              onPageChange={setCurrentResultsPage}
              onEventClick={handleResultsEventClick}
              scrollTop={resultsScrollTop}
              onScrollTopChange={setResultsScrollTop}
            />
          )}

          {sidebar.type === 'event' && (
            <EventSidebarContent eventId={sidebar.eventId} currentUserId={user?.id} />
          )}
        </SideBar>
      )}
    </>
  );
}

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

// Third-Party Styles
import 'leaflet/dist/leaflet.css';

// Layouts & Feature Components
import BottomBar from '../../../layouts/BottomBar';
import NavBar from '../../../layouts/NavBar';

// Marker & Map Visual Components
import { MapClickHandler, GlassZoomControl } from '../MapControls';
import { ClusterLayer } from './ClusterLayer';
import { AdminPanelLinks } from '../../externalLinks/AdminPanelLinks';
import MapHoverPreview from './MapHoverPreview';
import MapSidebarPanel, { type SidebarState } from './MapSidebarPanel';
import type { EventSortField, SortOrder } from '../../../api/events';

// State Management, Hooks & Helpers
import { useNotification } from '../../../context/notifications/useNotification';
import { useAuth } from '../../../context/auth/useAuth';
import { useMapEvents } from '../hooks/useMapEvents';
import { MapEventsHandler } from './MapHelper';

import { useTranslation } from 'react-i18next';
import { useTranslatedEvent } from '../../events/hooks/useTranslatedEvent';

// Constants & Configuration
import { PARIS_CENTER, DEFAULT_ZOOM, MAX_ZOOM, IDF_BOUNDS } from '../../../types/constants';

import type { EventGroup, EventItem } from '../../../types/event';
import { EventMapController } from './EventMapController';
import { mapPreferredCategory, mapPreferredLanguage } from '../utils/userPreferences';
// Local Styles
import '../Map.module.css';

export default function Map() {
  const { showWarning } = useNotification();
  const { user, justLoggedIn, clearJustLoggedIn } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [sidebar, setSidebar] = useState<SidebarState>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [resultsScrollTop, setResultsScrollTop] = useState(0);
  // When set, the results sidebar only lists the events of the clicked marker group
  const [groupEvents, setGroupEvents] = useState<EventItem[] | null>(null);
  // Event the map is zoomed on. Independent from the sidebar: a marker group click focuses
  // its first event while only showing the results list.
  const [focusEventId, setFocusEventId] = useState<string | null>(null);

  const [hoverPos, setHoverPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // True once a preview was pinned from the results sidebar (handleResultsEventClick). While
  // pinned, hovering other markers must not steal the active group / hover position.
  const [isPreviewPinned, setIsPreviewPinned] = useState(false);

  const [filters, setFilters] = useState<{
    city: string;
    startDate: string;
    endDate: string;
    priceType: string;
    category: string;
    q: string;
  }>({
    city: 'Paris',
    startDate: '',
    endDate: '',
    priceType: '',
    category: '',
    q: '',
  });

  // Results list ordering (server-side sort, see /events/search)
  const [resultsSort, setResultsSort] = useState<{ sort: EventSortField; order: SortOrder }>({
    sort: 'date',
    order: 'asc',
  });

  const resultsSearch = useMemo(
    () => ({
      q: filters.q,
      city: filters.city,
      from: filters.startDate,
      category: filters.category.trim(),
      price: filters.priceType,
      ...resultsSort,
    }),
    [filters, resultsSort]
  );

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Suppresses MapEventsHandler's "clear active group on zoom" while EventMapController is
  // programmatically flying to a selected event, so the hover-style preview survives that flight.
  const skipZoomClearRef = useRef(false);

  const {
    eventGroups,
    activeGroup,
    currentEvent,
    activeGroupId,
    activeEventIndex,
    setActiveGroup,
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
    if (isPreviewPinned) return;
    cancelCloseTimeout();

    closeTimeoutRef.current = setTimeout(() => {
      setActiveGroup(null);
      setActiveEventIndex(0);
      setHoverPos(null);
    }, 150);
  }, [isPreviewPinned, setActiveGroup, setActiveEventIndex]);

  /*
   * Open the event detail sidebar.
   */
  const handleOpenSidebar = useCallback(
    (id: string) => {
      cancelCloseTimeout();

      setGroupEvents(null);
      setFocusEventId(id);
      setSidebar({
        type: 'event',
        eventId: id,
      });

      setIsSidebarOpen(true);
      setActiveGroup(null);
      setHoverPos(null);
      setIsPreviewPinned(false);
    },
    [setActiveGroup]
  );

  /*
   * Open the paginated results sidebar.
   */
  const handleOpenResults = useCallback(() => {
    cancelCloseTimeout();

    setGroupEvents(null);
    setFocusEventId(null);
    setCurrentResultsPage(1);
    setResultsScrollTop(0);
    setSidebar({
      type: 'results',
    });

    setIsSidebarOpen(true);
    setActiveGroup(null);
    setHoverPos(null);
    setIsPreviewPinned(false);
  }, [setActiveGroup]);

  /*
   * Open the results sidebar restricted to the events of a marker group.
   */
  const handleOpenGroup = useCallback(
    (eventsInGroup: EventItem[]) => {
      cancelCloseTimeout();

      setGroupEvents(eventsInGroup);
      setFocusEventId(eventsInGroup[0]?.id ?? null);
      setCurrentResultsPage(1);
      setResultsScrollTop(0);
      setSidebar({ type: 'results' });
      setIsSidebarOpen(true);
      setActiveGroup(null);
      setHoverPos(null);
      setIsPreviewPinned(false);
    },
    [setActiveGroup]
  );

  /*
   * Called when an event is selected from the results sidebar.
   * Replace the results sidebar with the selected event details, and show its
   * preview card on the map as if the user were hovering its marker.
   */
  const handleResultsEventClick = useCallback(
    (eventId: string) => {
      setFocusEventId(eventId);
      setSidebar({
        type: 'event',
        eventId,
      });

      setIsSidebarOpen(true);

      const group = eventGroups.find((g) => g.events.some((event) => event.id === eventId));
      if (group) {
        const index = group.events.findIndex((event) => event.id === eventId);
        setActiveGroup(group);
        setActiveEventIndex(index >= 0 ? index : 0);
        setIsPreviewPinned(true);
      }
    },
    [eventGroups, setActiveGroup, setActiveEventIndex]
  );

  const handleMarkerHover = useCallback(
    (group: EventGroup) => {
      if (isPreviewPinned) return;
      cancelCloseTimeout();
      setActiveGroup(group);
    },
    [isPreviewPinned, setActiveGroup]
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
   * Text search handler (title, description, venue): filters the map and the results list.
   */
  const handleSearchChange = useCallback((q: string) => {
    setCurrentResultsPage(1);
    setResultsScrollTop(0);

    setFilters((prev) => ({
      ...prev,
      q,
    }));
  }, []);

  const handleSortChange = useCallback((sort: EventSortField, order: SortOrder) => {
    setCurrentResultsPage(1);
    setResultsScrollTop(0);
    setResultsSort({ sort, order });
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
      // One-shot reaction to the login event, guarded by justLoggedIn: no cascading renders.
      /* eslint-disable react-hooks/set-state-in-effect */
      setCurrentResultsPage(1);
      setResultsScrollTop(0);
      setFilters((prev) => ({ ...prev, category: preferredCategory }));
      /* eslint-enable react-hooks/set-state-in-effect */
    }

    clearJustLoggedIn();
  }, [justLoggedIn, user, i18n, clearJustLoggedIn]);

  return (
    <>
      <MapContainer
        center={PARIS_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={DEFAULT_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        maxBounds={IDF_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        className="h-full w-full"
      >
        <EventMapController
          eventId={focusEventId}
          events={events}
          skipZoomClearRef={skipZoomClearRef}
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
          maxZoom={MAX_ZOOM}
          keepBuffer={2}
          updateWhenIdle={false}
        />

        <GlassZoomControl />

        <AdminPanelLinks />

        <MapEventsHandler
          activeGroup={activeGroup}
          setActiveGroup={setActiveGroup}
          setHoverPos={setHoverPos}
          skipZoomClearRef={skipZoomClearRef}
        />

        <ClusterLayer
          eventGroups={eventGroups}
          activeGroupId={activeGroupId}
          onMarkerClick={handleOpenSidebar}
          onGroupClick={handleOpenGroup}
          onMarkerHover={handleMarkerHover}
          onMarkerLeave={handleMouseLeave}
        />
      </MapContainer>

      {/* Event preview shown when hovering a marker group */}
      <MapHoverPreview
        currentEvent={currentEvent}
        activeGroup={activeGroup}
        hoverPos={hoverPos}
        title={displayedHoverTitle}
        category={displayedHoverCategory}
        isTranslating={isHoverTranslating}
        activeEventIndex={activeEventIndex}
        onPrev={handlePrevEvent}
        onNext={() => handleNextEvent(undefined, (activeGroup?.events.length ?? 1) - 1)}
        onClick={() => currentEvent && handleOpenSidebar(currentEvent.id)}
        onOpenGroup={() => activeGroup && handleOpenGroup(activeGroup.events)}
        onMouseEnter={cancelCloseTimeout}
        onMouseLeave={handleMouseLeave}
      />

      {/* Navigation and category filters */}
      <NavBar
        activeCategory={filters.category}
        onSelectCategory={handleSelectCategory}
        onOpenResults={handleOpenResults}
        priceType={filters.priceType}
        onPriceChange={handlePriceChange}
        startDate={filters.startDate}
        onDateChange={handleDateChange}
        searchQuery={filters.q}
        onSearchChange={handleSearchChange}
      />

      <BottomBar />

      {/* Sidebar */}
      <MapSidebarPanel
        sidebar={sidebar}
        isOpen={isSidebarOpen}
        currentUserId={user?.id}
        groupEvents={groupEvents}
        search={resultsSearch}
        onSortChange={handleSortChange}
        currentResultsPage={currentResultsPage}
        onPageChange={setCurrentResultsPage}
        resultsScrollTop={resultsScrollTop}
        onResultsScrollTopChange={setResultsScrollTop}
        onEventClick={handleResultsEventClick}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        onClose={() => {
          setSidebar(null);
          setFocusEventId(null);
          setActiveGroup(null);
          setHoverPos(null);
          setIsPreviewPinned(false);
        }}
        onBack={() => {
          // Keep the map where it is when returning to a marker group's list
          if (!groupEvents) setFocusEventId(null);
          setSidebar({ type: 'results' });
          setIsSidebarOpen(true);
          setActiveGroup(null);
          setHoverPos(null);
          setIsPreviewPinned(false);
        }}
      />
    </>
  );
}

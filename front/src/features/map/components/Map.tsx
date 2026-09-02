import React, { useState, useRef, useCallback } from 'react';
import { MapContainer } from 'react-leaflet';

// Third-Party Styles
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// Layouts & Feature Components
import SideBar from '../../../layouts/Sidebar';
import NavBar from '../../../layouts/NavBar';
import BottomBar from '../../../layouts/BottomBar';
import Filters from './Filters';

// Marker & Map Visual Components
import { MyTileLayer, MapClickHandler, GlassZoomControl } from '../MapControls';
import EventPreview from '../../events/components/EventPreview';
import { ClusterLayer } from './ClusterLayer';

// State Management, Hooks & Helpers
import { useNotification } from '../../../context/notifications/NotificationContext';
import { useAuth } from '../../../context/auth/AuthContext';
import { useMapEvents } from '../hooks/useMapEvents';
import { MapEventsHandler } from './MapHelper';

// Constants & Configuration
import { PARIS_CENTER, DEFAULT_ZOOM, IDF_BOUNDS } from '../Map.constants';

// Local Styles
import '../Map.module.css';

interface MapProps {
  onOpenAuth: () => void;
}

export default function Map({ onOpenAuth }: MapProps) {
  const { showError } = useNotification();
  const { user } = useAuth();
  const [activeSidebarEventId, setActiveSidebarEventId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // État local des filtres actif avec typage strict
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

  // Handler mémorisé pour la sélection de catégorie via NavBar
  const handleSelectCategory = useCallback((selectedCategory: string) => {
    setFilters((prev) => {
      // 1. If clicking "All" or an empty value, always reset category to ''
      if (!selectedCategory || selectedCategory.trim() === '') {
        return { ...prev, category: '' };
      }

      // 2. Check if the clicked category is already active (case-insensitive)
      const isAlreadyActive =
        prev.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      // 3. Toggle off if already active, otherwise select the new category
      const nextCategory = isAlreadyActive ? '' : selectedCategory;

      console.log('[Map] Category selection updated to:', nextCategory);

      return {
        ...prev,
        category: nextCategory,
      };
    });
  }, []);

  // Handler mémorisé pour les filtres modaux
  const handleApplyFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

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
        <EventPreview
          position={hoverPos}
          title={currentEvent.title}
          dateStart={currentEvent.dateStart}
          dateEnd={currentEvent.dateEnd}
          category={currentEvent.category?.[0] || 'Event'}
          isOpen={true}
          eventId={currentEvent.id}
          interestedUsersCount={currentEvent.interestedUsersCount || 0}
          imageUrl={currentEvent.coverUrl}
          totalInGroup={activeGroup.events.length}
          currentIndex={activeEventIndex}
          onPrev={handlePrevEvent}
          onNext={() => handleNextEvent(undefined, activeGroup.events.length - 1)}
          onClick={() => setActiveSidebarEventId(currentEvent.id)}
          onMouseEnter={cancelCloseTimeout}
          onMouseLeave={handleMouseLeave}
        />
      )}

      <Filters onApplyFilters={handleApplyFilters} />

      <NavBar activeCategory={filters.category} onSelectCategory={handleSelectCategory} />

      <BottomBar onOpenAuth={onOpenAuth} />

      {activeSidebarEventId && (
        <SideBar
          eventId={activeSidebarEventId}
          currentUserId={user?.id}
          onClose={() => {
            setActiveSidebarEventId(null);
            setHoverPos(null);
          }}
        />
      )}
    </>
  );
}

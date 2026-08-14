import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import MySidebar from '../Sidebar/Sidebar';
import MarkerHoverCard from './MarkerHoverCard.tsx';
import { createMarkerIcon, createClusterIcon, clusterCountCache } from './CustomIcons.tsx';

import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import './Map.css';

const idfBounds = new L.LatLngBounds([48.65, 1.95], [49.05, 2.75]);

// 1. Move static cluster radius logic outside component so reference remains identical across renders
const getClusterRadius = (zoom: number) => {
  if (zoom <= 13) return 90;
  if (zoom <= 16) return 70;
  if (zoom <= 18) return 50;
  return 20;
};

function MyTileLayer() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://jawg.io">JawgMaps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=4WuRvsSGNfmiSQizbI3DVZxUqDNOgTXjHvNMXONKplADuRzTbn7p0x5wlenNak14"
    />
  );
}

function MapClickHandler({ closeSidebar }: { closeSidebar: () => void }) {
  useMapEvents({ click: closeSidebar });
  return null;
}

function GlassZoomControl() {
  const map = useMap();
  useEffect(() => {
    const zoomControl = L.control.zoom({ position: 'topleft' });
    zoomControl.addTo(map);
    return () => {
      zoomControl.remove();
    };
  }, [map]);
  return null;
}

// 2. Debounce & consolidate viewport handlers to eliminate duplicate fetches
function MapEventsHandler({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFetch = useCallback(
    (map: L.Map) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onBoundsChange(map.getBounds());
      }, 250); // 250ms debounce prevents API spam during panning/zooming
    },
    [onBoundsChange]
  );

  const map = useMapEvents({
    moveend: () => triggerFetch(map),
    zoomend: () => triggerFetch(map),
  });

  useEffect(() => {
    triggerFetch(map);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [map, triggerFetch]);

  return null;
}

export default function MyMap() {
  const [activeSidebarEventId, setActiveSidebarEventId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  const loadedEventIdsRef = useRef<Set<string>>(new Set());
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeItem = useMemo(() => {
    return events.find((item) => item.id === hoveredMarkerId);
  }, [events, hoveredMarkerId]);

  const fetchEventsForBbox = useCallback(async (bounds: L.LatLngBounds) => {
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      // Truncate coordinates to 3 decimal places
      const swLng = sw.lng.toFixed(3);
      const swLat = sw.lat.toFixed(3);
      const neLng = ne.lng.toFixed(3);
      const neLat = ne.lat.toFixed(3);

      // Combine into the format your DTO expects with cleaner numbers
      const bboxString = `${swLng},${swLat},${neLng},${neLat}`;

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/events/map?bbox=${encodeURIComponent(bboxString)}`);

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch map events:', err);
    }
  }, []);

  const cancelCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    cancelCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredMarkerId(null);
      setHoverPos(null);
    }, 150);
  };

  useEffect(() => () => cancelCloseTimeout(), []);

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
        <MapEventsHandler onBoundsChange={fetchEventsForBbox} />
        <MapClickHandler closeSidebar={() => setActiveSidebarEventId(null)} />
        <MyTileLayer />
        <GlassZoomControl />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={getClusterRadius} // Static function reference prevents cluster re-creation
          disableClusteringAtZoom={16}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          // 3. Delegate cluster animation state calculation internally to createClusterIcon
          iconCreateFunction={(cluster) => createClusterIcon(cluster)}
        >
          {events.map((event) => {
            const isHovered = hoveredMarkerId === event.id;

            return (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={createMarkerIcon(isHovered, event.isNew)}
                eventHandlers={{
                  click: () => {
                    cancelCloseTimeout();
                    setActiveSidebarEventId(event.id);
                    setHoveredMarkerId(null);
                    setHoverPos(null);
                  },
                  mouseover: (e) => {
                    cancelCloseTimeout();
                    const mouseEvent = e.originalEvent as MouseEvent;
                    setHoveredMarkerId(event.id);
                    setHoverPos({ x: mouseEvent.clientX, y: mouseEvent.clientY });
                  },
                  mouseout: handleMouseLeave,
                }}
              />
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {activeItem && hoverPos && (
        <MarkerHoverCard
          position={hoverPos}
          title={activeItem.title}
          category={activeItem.category || 'Event'}
          isOpen={true}
          closingTime={
            activeItem.dateEnd
              ? new Date(activeItem.dateEnd).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '11:00 PM'
          }
          interestedUsersCount={activeItem.interestedUsersCount || 0}
          imageUrl={activeItem.coverUrl}
          onClick={() => setActiveSidebarEventId(activeItem.id)}
          onMouseEnter={() => {
            cancelCloseTimeout();
            setHoveredMarkerId(activeItem.id);
          }}
          onMouseLeave={() => {
            if (activeSidebarEventId !== activeItem.id) {
              handleMouseLeave();
            }
          }}
        />
      )}

      {activeSidebarEventId && (
        <MySidebar
          eventId={activeSidebarEventId}
          currentUserId={1} // TODO: Replace with actual logged-in user state ID
          onClose={() => {
            setActiveSidebarEventId(null);
            setHoverPos(null);
          }}
        />
      )}
    </>
  );
}

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import { useState, useRef, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import MySidebar from '../Sidebar/Sidebar';
import MarkerHoverCard from './MarkerHoverCard.tsx';
import './Map.css';

const idfBounds = new LatLngBounds([48.65, 1.95], [49.05, 2.75]);

function MyTileLayer() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=4WuRvsSGNfmiSQizbI3DVZxUqDNOgTXjHvNMXONKplADuRzTbn7p0x5wlenNak14"
    />
  );
}

function MapClickHandler({ closeSidebar }: { closeSidebar: () => void }) {
  useMapEvents({
    click: () => {
      closeSidebar();
    },
  });

  return null;
}

function GlassZoomControl() {
  const map = useMap();

  useEffect(() => {
    const zoomControl = L.control.zoom({
      position: 'topleft',
    });

    zoomControl.addTo(map);

    return () => {
      zoomControl.remove();
    };
  }, [map]);

  return null;
}

// Custom SVG Pinpoint matching the shape and #3100B6 color with hover scale effect
const createCustomIcon = (isHovered: boolean) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
            <div style="
                width: 40px;
                height: 50px;
                transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};
                transform-origin: bottom center;
                transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                filter: drop-shadow(0 6px 8px rgba(0,0,0,0.25));
                display: flex;
                align-items: center;
                justify-content: center;
            ">

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
                    <defs>
                        <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#4B22D4" />
                            <stop offset="50%" stop-color="#3100B6" />
                            <stop offset="100%" stop-color="#1F0075" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#pinGradient)" d="M256 0C150.13 0 64 86.13 64 192c0 110.5 165.25 284.14 172.3 291.68a24 24 0 0 0 34.4 0C278.75 476.14 444 302.5 444 192C444 86.13 357.87 0 256 0zm0 304c-61.86 0-112-50.14-112-112s50.14-112 112-112 112 50.14 112 112-50.14 112-112 112z"/>
                    <circle fill="#FFFFFF" cx="256" cy="192" r="110"/>
                    <circle fill="#3100B6" cx="256" cy="192" r="28"/>
                </svg>

            </div>
        `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });
};

// Helper component to track map viewport changes and trigger fetches
function MapEventsHandler({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

export default function MyMap() {
  // Store messages by marker ID: { [eventId]: Message[] }
  const [messagesByEvent, setMessagesByEvent] = useState<Record<string, any[]>>({});

  // Track which event ID's sidebar is currently open (null means closed)
  const [activeSidebarEventId, setActiveSidebarEventId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // Ref to hold the map instance and zoom control so we can add it safely
  const mapRef = useRef<L.Map | null>(null);

  // Ref to hold the close timer
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeItem = events.find((item) => item.id === hoveredMarkerId);

  // Fetch events matching your backend's expected bounding box coordinates
  const fetchEventsForBbox = useCallback(async (bounds: L.LatLngBounds) => {
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      // Combine coordinates into the exact string format your DTO expects: minLon,minLat,maxLon,maxLat
      const bboxString = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;

      // Use the environment variable with a fallback to localhost:3000
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

  useEffect(() => {
    return () => cancelCloseTimeout();
  }, []);

  // Effect to add the custom zoom control once the map initializes
  useEffect(() => {
    if (mapRef.current) {
      const zoomControl = L.control.zoom({
        position: 'topleft',
      });
      zoomControl.addTo(mapRef.current);

      return () => {
        zoomControl.remove();
      };
    }
  }, []);

  return (
    <>
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={12}
        minZoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100vh', width: '100vw' }}
      >
        <MapEventsHandler onBoundsChange={fetchEventsForBbox} />
        <MapClickHandler closeSidebar={() => setActiveSidebarEventId(null)} />
        <MyTileLayer />
        <GlassZoomControl />

        {events.map((event) => {
          const isHovered = hoveredMarkerId === event.id;

          return (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={createCustomIcon(isHovered)}
              eventHandlers={{
                click: () => {
                  cancelCloseTimeout();
                  // 1. Open the sidebar for this specific event
                  setActiveSidebarEventId(event.id);

                  // 2. Reset the marker and hover card back to their original state
                  setHoveredMarkerId(null);
                  setHoverPos(null);
                },
                mouseover: (e) => {
                  cancelCloseTimeout();
                  const mouseEvent = e.originalEvent as MouseEvent;
                  setHoveredMarkerId(event.id);
                  setHoverPos({ x: mouseEvent.clientX, y: mouseEvent.clientY });
                },
                mouseout: () => handleMouseLeave(),
              }}
            />
          );
        })}
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
            // Only trigger leave timeout if the sidebar for this item isn't open
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

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import { useState, useRef, useEffect } from 'react';
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

function MyMap() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  // Ref to hold the map instance and zoom control so we can add it safely
  const mapRef = useRef<L.Map | null>(null);

  // Ref to hold the close timer
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    cancelCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsMarkerHovered(false);
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

  const mockFriends = [
    { id: '1', name: 'Alice', avatarUrl: 'https://via.placeholder.com/50' },
    { id: '2', name: 'Bob', avatarUrl: 'https://via.placeholder.com/50' },
  ];

  return (
    <>
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={12}
        minZoom={12}
        scrollWheelZoom={true}
        maxBounds={idfBounds}
        maxBoundsViscosity={1.0}
        zoomControl={false} // Disable default
        style={{ height: '100vh', width: '100vw' }}
      >
        <MapClickHandler closeSidebar={() => setShowSidebar(false)} />
        <MyTileLayer />
        <GlassZoomControl />
        <Marker
          position={[48.8566, 2.3522]}
          icon={createCustomIcon(isMarkerHovered)}
          eventHandlers={{
            click: () => {
              setShowSidebar(true);
            },
            mouseover: (e) => {
              cancelCloseTimeout();
              const mouseEvent = e.originalEvent as MouseEvent;
              setIsMarkerHovered(true);
              setHoverPos({ x: mouseEvent.clientX, y: mouseEvent.clientY });
            },
            mouseout: () => {
              handleMouseLeave();
            },
          }}
        />
      </MapContainer>

      {isMarkerHovered && hoverPos && (
        <MarkerHoverCard
          position={hoverPos}
          title="Event Title"
          category="Music & Arts"
          isOpen={true}
          closingTime="11:00 PM"
          interestedUsersCount={14}
          isConnected={true}
          interestedFriends={mockFriends}
          onClick={() => setShowSidebar(true)} // <-- Add this handler here
          onMouseEnter={() => {
            cancelCloseTimeout();
            setIsMarkerHovered(true);
          }}
          onMouseLeave={() => {
            handleMouseLeave();
          }}
        />
      )}

      {showSidebar && <MySidebar onClose={() => setShowSidebar(false)} />}
    </>
  );
}

export default MyMap;

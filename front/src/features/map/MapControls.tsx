import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export function MapClickHandler({ closeSidebar }: { closeSidebar: () => void }) {
  useMapEvents({ click: closeSidebar });
  return null;
}

export function GlassZoomControl() {
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

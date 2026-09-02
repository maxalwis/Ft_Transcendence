import { useEffect } from 'react';
import { TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';

export function MyTileLayer() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://jawg.io">JawgMaps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=4WuRvsSGNfmiSQizbI3DVZxUqDNOgTXjHvNMXONKplADuRzTbn7p0x5wlenNak14"
    />
  );
}

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
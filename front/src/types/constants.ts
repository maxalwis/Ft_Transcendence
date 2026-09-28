import L from 'leaflet';

export const PARIS_CENTER: [number, number] = [48.8566, 2.3522];
export const DEFAULT_ZOOM = 12;
// JawgMaps tiles (proxied through the backend, capped at 22 there) render reliably up to 20;
// Leaflet defaults to 18, which caps how far nearby-but-distinct event markers can separate.
export const MAX_ZOOM = 20;

export const IDF_BOUNDS = new L.LatLngBounds([48.65, 1.95], [49.05, 2.75]);

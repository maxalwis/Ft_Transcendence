declare module 'react-leaflet-cluster' {
  import { ComponentType } from 'react';
  import { MarkerClusterGroupProps } from 'leaflet';
  const MarkerClusterGroup: ComponentType<MarkerClusterGroupProps & { children?: React.ReactNode }>;
  export default MarkerClusterGroup;
}

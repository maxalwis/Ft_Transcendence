import { ComponentType } from 'react';
import { MarkerClusterGroupProps } from 'leaflet';

declare module 'react-leaflet-cluster' {
  const MarkerClusterGroup: ComponentType<MarkerClusterGroupProps & { children?: React.ReactNode }>;
  export default MarkerClusterGroup;
}
<<<<<<< HEAD

// Ajout des déclarations CSS ici pour éliminer les dernières erreurs
declare module 'leaflet/dist/leaflet.css';
declare module 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
declare module 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
=======
>>>>>>> dev

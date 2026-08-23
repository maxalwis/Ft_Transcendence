import { Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { EventGroup } from './Map';
import { createGroupMarkerIcon, createClusterIcon } from './CustomIcons';

interface ClusterLayerProps {
  eventGroups: EventGroup[];
  activeGroupId: string | null;
  onMarkerClick: (id: string) => void;
  onMarkerHover: (groupId: string, e: L.LeafletMouseEvent) => void;
  onMarkerLeave: () => void;
}

export function ClusterLayer({
  eventGroups = [],
  activeGroupId,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave,
}: ClusterLayerProps) {
  const getClusterRadius = (zoom: number) => {
    if (zoom <= 13) return 90;
    if (zoom <= 16) return 70;
    if (zoom <= 18) return 50;
    return 40;
  };

  return (
    <MarkerClusterGroup
      chunkedLoading
      chunkInterval={100}
      chunkDelay={50}
      maxClusterRadius={getClusterRadius}
      showCoverageOnHover={false}
      // Cluster groups use createClusterIcon
      iconCreateFunction={(cluster) => createClusterIcon(cluster)}
    >
      {eventGroups.map((group) => {
        const isHovered = activeGroupId === group.id;
        const count = group.events.length;
        const primaryEvent = group.events[0];

        if (!primaryEvent) return null;

        return (
          <Marker
            key={group.id}
            position={[group.latitude, group.longitude]}
            // Individual location pins use createGroupMarkerIcon (badge appears automatically if count > 1)
            icon={createGroupMarkerIcon(count, isHovered)}
            eventHandlers={{
              click: () => onMarkerClick(primaryEvent.id),
              mouseover: (e) => onMarkerHover(group.id, e),
              mouseout: () => onMarkerLeave(),
            }}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

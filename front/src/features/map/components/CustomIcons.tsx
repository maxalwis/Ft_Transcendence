import L from 'leaflet';
import type { MarkerCluster } from 'leaflet';

export const clusterCountCache = new Map<number, number>();

/**
 * 1. SINGLE EVENT PIN (Original Cobalt Tinted Glass SVG)
 */
export const createMarkerIcon = (isHovered: boolean = false, isNew: boolean = false) => {
  return L.divIcon({
    className: 'custom-map-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    html: `
      <div class="${isNew ? 'marker-pop-animation' : ''}" style="width: 100%; height: 100%;">
        <div style="
            width: 40px;
            height: 50px;
            transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};
            transform-origin: bottom center;
            transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
                <defs>
                    <linearGradient id="blueGlassBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4B22D4" stop-opacity="0.90" />
                        <stop offset="50%" stop-color="#3100B6" stop-opacity="0.80" />
                        <stop offset="100%" stop-color="#1F0075" stop-opacity="0.88" />
                    </linearGradient>

                    <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85" />
                        <stop offset="45%" stop-color="#8099FF" stop-opacity="0.45" />
                        <stop offset="100%" stop-color="#3100B6" stop-opacity="0.0" />
                    </linearGradient>

                    <linearGradient id="glassBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
                        <stop offset="60%" stop-color="#80A0FF" stop-opacity="0.5" />
                        <stop offset="100%" stop-color="#4B22D4" stop-opacity="0.8" />
                    </linearGradient>
                </defs>

                <path fill="url(#blueGlassBody)" 
                      stroke="url(#glassBorder)" 
                      strokeWidth="12" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M256 12C150.13 12 64 98.13 64 204c0 110.5 165.25 284.14 172.3 291.68a24 24 0 0 0 34.4 0C278.75 488.14 444 314.5 444 204C444 98.13 357.87 12 256 12z" />

                <path fill="url(#glassReflection)" 
                      d="M256 24C156.7 24 76 104.7 76 204c0 88.5 130 230 180 278 50-48 180-189.5 180-278C436 104.7 355.3 24 256 24z" />

                <circle fill="#FFFFFF" cx="256" cy="204" r="100" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))" />
                <circle fill="#25008B" cx="256" cy="204" r="32" />
                <circle fill="#FFFFFF" fill-opacity="0.75" cx="246" cy="194" r="9" />
            </svg>
        </div>
      </div>
    `,
  });
};

/**
 * 2. MULTI-EVENT LOCATION GROUP PIN
 * Uses createMarkerIcon for single events, or overlays an orange badge (#FF6507) when count > 1.
 */
export const createGroupMarkerIcon = (
  count: number = 1,
  isHovered: boolean = false,
  isNew: boolean = false
) => {
  if (count <= 1) {
    return createMarkerIcon(isHovered, isNew);
  }

  return L.divIcon({
    className: 'custom-map-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    html: `
      <div class="${isNew ? 'marker-pop-animation' : ''}" style="width: 100%; height: 100%; position: relative;">
        <div style="
            width: 40px;
            height: 50px;
            transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};
            transform-origin: bottom center;
            transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
                <defs>
                    <linearGradient id="blueGlassBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4B22D4" stop-opacity="0.90" />
                        <stop offset="50%" stop-color="#3100B6" stop-opacity="0.80" />
                        <stop offset="100%" stop-color="#1F0075" stop-opacity="0.88" />
                    </linearGradient>

                    <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85" />
                        <stop offset="45%" stop-color="#8099FF" stop-opacity="0.45" />
                        <stop offset="100%" stop-color="#3100B6" stop-opacity="0.0" />
                    </linearGradient>

                    <linearGradient id="glassBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
                        <stop offset="60%" stop-color="#80A0FF" stop-opacity="0.5" />
                        <stop offset="100%" stop-color="#4B22D4" stop-opacity="0.8" />
                    </linearGradient>
                </defs>

                <path fill="url(#blueGlassBody)" 
                      stroke="url(#glassBorder)" 
                      ="12" 
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M256 12C150.13 12 64 98.13 64 204c0 110.5 165.25 284.14 172.3 291.68a24 24 0 0 0 34.4 0C278.75 488.14 444 314.5 444 204C444 98.13 357.87 12 256 12z" />

                <path fill="url(#glassReflection)" 
                      d="M256 24C156.7 24 76 104.7 76 204c0 88.5 130 230 180 278 50-48 180-189.5 180-278C436 104.7 355.3 24 256 24z" />

                <circle fill="#FFFFFF" cx="256" cy="204" r="100" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))" />
                <circle fill="#25008B" cx="256" cy="204" r="32" />
                <circle fill="#FFFFFF" fill-opacity="0.75" cx="246" cy="194" r="9" />
            </svg>

            <!-- Stacked Location Event Count Badge -->
            <div style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: #FF6507;
                color: #FFFFFF;
                font-family: system-ui, -apple-system, sans-serif;
                font-weight: 800;
                font-size: 11px;
                height: 20px;
                min-width: 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
                border: 2px solid #FFFFFF;
                z-index: 10;
            ">${count}</div>
        </div>
      </div>
    `,
  });
};

/**
 * 3. LEAFLET CLUSTER BADGE
 * Groups multiple spatial pins dynamically based on zoom level.
 */
export const createClusterIcon = (cluster: MarkerCluster, isHovered: boolean = false) => {
  const count = cluster.getChildCount();
  const clusterId = (cluster as unknown as { _leaflet_id: number })._leaflet_id;

  const prevCount = clusterCountCache.get(clusterId);
  const isBrandNewCluster = prevCount === undefined;
  const isCountUpdated = !isBrandNewCluster && prevCount !== count;

  clusterCountCache.set(clusterId, count);

  let baseSize: number;
  let ringRadius: number;
  let topColor = '#9C82F7';
  let midColor = '#7B56EC';
  let botColor = '#5A2EE1';

  if (count < 10) {
    baseSize = 36;
    ringRadius = 0;
  } else if (count < 50) {
    baseSize = 44;
    ringRadius = 6;
    topColor = '#6D46E6';
    midColor = '#4B22D4';
    botColor = '#3100B6';
  } else {
    baseSize = 54;
    ringRadius = 10;
    topColor = '#4B22D4';
    midColor = '#3100B6';
    botColor = '#1F0075';
  }

  const fontSize = count > 999 ? 11 : count > 99 ? 12 : 14;
  const formattedCount = count > 999 ? `${(count / 1000).toFixed(1)}k` : count;
  const gradientId = `clusterGrad_${count}_${topColor.replace('#', '')}`;
  const hoverTransform = isHovered ? 'scale(1.15)' : 'scale(1)';

  const clusterAnimClass = isBrandNewCluster ? 'cluster-pop-animation' : '';
  const counterAnimClass = isCountUpdated ? 'counter-pop-animation' : '';

  return L.divIcon({
    className: 'custom-map-marker',
    iconSize: [baseSize, baseSize],
    iconAnchor: [baseSize / 2, baseSize / 2],
    html: `
      <div class="${clusterAnimClass}" style="width: 100%; height: 100%;">
        <div style="
            width: ${baseSize}px;
            height: ${baseSize}px;
            transform: ${hoverTransform};
            transform-origin: center center;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        ">
            ${
              ringRadius > 0
                ? `<div style="
                      position: absolute;
                      top: -${ringRadius}px;
                      left: -${ringRadius}px;
                      width: ${baseSize + ringRadius * 2}px;
                      height: ${baseSize + ringRadius * 2}px;
                      border-radius: 50%;
                      background-color: ${botColor};
                      opacity: 0.2;
                      pointer-events: none;
                  "></div>`
                : ''
            }

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" style="position: absolute; top: 0; left: 0; filter: drop-shadow(0 6px 8px rgba(0,0,0,0.25));">
                <defs>
                    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${topColor}" />
                        <stop offset="50%" stop-color="${midColor}" />
                        <stop offset="100%" stop-color="${botColor}" />
                    </linearGradient>
                </defs>
                <circle fill="url(#${gradientId})" cx="256" cy="256" r="240"/>
                <circle fill="#FFFFFF" cx="256" cy="256" r="140"/>
            </svg>

            <span class="${counterAnimClass}" style="
                position: relative;
                z-index: 200;
                font-family: system-ui, -apple-system, sans-serif;
                font-weight: 700;
                font-size: ${fontSize}px;
                color: ${botColor};
                line-height: 1;
            ">
                ${formattedCount}
            </span>
        </div>
      </div>
    `,
  });
};

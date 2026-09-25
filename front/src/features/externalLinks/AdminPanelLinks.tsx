import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import Button from '../../components/ui/Button';

interface DashboardLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

const dashboards: DashboardLink[] = [
  {
    name: 'Prisma Studio',
    url: 'https://localhost:8444',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="-27 0 310 310"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
        fill="currentColor"
      >
        <g>
          <path
            d="M254.312882,235.518775 L148.000961,9.74987264 C145.309805,4.08935083 139.731924,0.359884549 133.472618,0.0359753113 C127.198908,-0.384374336 121.212054,2.71925839 117.939655,8.08838662 L2.63252565,194.847143 C-0.947129465,200.604248 -0.871814894,207.912774 2.8257217,213.594888 L59.2003287,300.896318 C63.5805009,307.626626 71.8662281,310.673635 79.5631922,308.384597 L243.161606,259.992851 C248.145475,258.535702 252.252801,254.989363 254.421072,250.271225 C256.559881,245.57581 256.523135,240.176915 254.32061,235.511047 L254.312882,235.518775 Z M230.511129,245.201761 L91.6881763,286.252058 C87.4533189,287.511696 83.388474,283.840971 84.269448,279.567474 L133.866738,42.0831633 C134.794079,37.6396542 140.929985,36.9364206 142.869673,41.0476325 L234.684164,236.021085 C235.505704,237.779423 235.515611,239.809427 234.711272,241.575701 C233.906934,243.341974 232.369115,244.667163 230.503401,245.201761 L230.511129,245.201761 Z"
            fillRule="nonzero"
          />
        </g>
      </svg>
    ),
  },
  {
    name: 'Elasticsearch',
    url: 'https://localhost:8445',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <path d="m20.345 16.33-3.959-.926-1.05-2.01 5.177-4.535a3.962 3.962 0 0 1 2.559 3.702 4.006 4.006 0 0 1-2.727 3.77m-2.976 4.68c-.616 0-1.22-.207-1.714-.587l.782-4.077 3.596.841c.115.31.172.642.172.987a2.839 2.839 0 0 1-2.836 2.836m-2.637-.586a5.92 5.92 0 0 1-4.908 2.6A5.947 5.947 0 0 1 4 15.905l5.167-4.67 5.272 2.403 1.167 2.23zM.928 11.443a4.007 4.007 0 0 1 2.726-3.77l3.95.933.927 1.98-5.05 4.565a3.97 3.97 0 0 1-2.553-3.708m5.703-8.45a2.841 2.841 0 0 1 1.723.58l-.789 4.092-3.598-.85a2.842 2.842 0 0 1-.172-.986A2.84 2.84 0 0 1 6.63 2.992m2.66.59A5.92 5.92 0 0 1 20.1 6.93c0 .4-.038.781-.114 1.164l-5.299 4.643-5.251-2.394-1.026-2.19zM24 12.571a4.723 4.723 0 0 0-3.124-4.454 6.695 6.695 0 0 0 .126-1.29A6.789 6.789 0 0 0 14.22.047 6.769 6.769 0 0 0 8.727 2.86a3.586 3.586 0 0 0-2.204-.754A3.604 3.604 0 0 0 3.15 6.959 4.786 4.786 0 0 0 0 11.431 4.727 4.727 0 0 0 3.139 15.9a6.876 6.876 0 0 0-.124 1.289 6.773 6.773 0 0 0 6.765 6.765c2.19 0 4.22-1.052 5.49-2.824a3.568 3.568 0 0 0 2.207.769 3.603 3.603 0 0 0 3.374-4.854A4.785 4.785 0 0 0 24 12.572Z" />
      </svg>
    ),
  },
];

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isButton = buttonRef.current && buttonRef.current.contains(target);
      const isMenu = document.getElementById('admin-links-dropdown')?.contains(target);

      if (!isButton && !isMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <a
        ref={buttonRef}
        href="#"
        onClick={handleClick}
        className="leaflet-control-btn flex items-center justify-center cursor-pointer transition-transform active:scale-95 no-underline box-border text-center"
        role="button"
        aria-label="Parameters"
        title="Parameters"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </a>

      {isOpen &&
        createPortal(
          <div
            id="admin-links-dropdown"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 50,
            }}
            className="glass-panel glass-animate-in w-64 p-3 pointer-events-auto"
          >
            <div className="flex flex-col gap-2">
              {dashboards.map((tool) => (
                <Button variant="ghost"
                  key={tool.name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(tool.url, '_blank', 'noopener,noreferrer');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/40 hover:bg-white/80 border border-blue-400/30 hover:border-blue-400/60 transition-all text-start group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-900 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">{tool.name}</div>
                  </div>
                  <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    ↗
                  </span>
                </Button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export const AdminPanelLinks: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const topLeftContainer = map.getContainer().querySelector('.leaflet-top.leaflet-left');
    if (!topLeftContainer) return;
    let animationFrameId: number;
    let controlDiv: HTMLDivElement | null = null;
    let root: ReturnType<typeof createRoot> | null = null;
    let attempts = 0;
    const maxAttempts = 100; // ~2 seconds of retries

    const attachControl = () => {
      const topLeftContainer = document.querySelector('.leaflet-top.leaflet-left');

      if (topLeftContainer) {
        controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-links');

        // Force the element onto its own layer on top of Leaflet controls
        controlDiv.style.position = 'relative';
        controlDiv.style.zIndex = '50';

        L.DomEvent.disableClickPropagation(controlDiv);
        L.DomEvent.disableScrollPropagation(controlDiv);

        root = createRoot(controlDiv);
        root.render(<DropdownMenu />);

        // Prepend instead of append to place it at the top of the container stack
        if (topLeftContainer.firstChild) {
          topLeftContainer.insertBefore(controlDiv, topLeftContainer.firstChild);
        } else {
          topLeftContainer.appendChild(controlDiv);
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        animationFrameId = requestAnimationFrame(attachControl);
      }
    };

    attachControl();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (root) {
        queueMicrotask(() => {
          root?.unmount();
        });
      }
      if (controlDiv) {
        controlDiv.remove();
      }
    };
  }, [map]);

  return null;
};

import React, { useMemo } from 'react';
import type { EventItem } from '../../../types/event';

export interface EventsDetailsProps {
  position?: { x?: number; y?: number };
  title?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  isOpen?: boolean;
  closingTime?: string;
  interestedUsersCount?: number;
  imageUrl?: string;
  totalInGroup?: number;
  currentIndex?: number;
  onPrev?: (e?: React.MouseEvent) => void;
  onNext?: (e?: React.MouseEvent, maxIndex?: number) => void;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CARD_HEIGHT = 180; // Légèrement augmenté pour laisser de la place aux dates

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventsDetails({
  position = { x: 0, y: 0 },
  title,
  category,
  dateStart,
  dateEnd,
  closingTime = '11:00 PM',
  interestedUsersCount = 0,
  imageUrl = '/event_image.webp',
  totalInGroup = 1,
  currentIndex = 0,
  onPrev,
  onNext,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: EventsDetailsProps) {
  if (typeof position.y !== 'number' || typeof position.x !== 'number') {
    return null;
  }

  const posY = position.y;
  const posX = position.x;

  const isFlippedDownward = useMemo(() => {
    return posY - CARD_HEIGHT < 75;
  }, [posY]);

  const topPos = isFlippedDownward ? posY : posY - 60;
  const transformOrigin = isFlippedDownward ? 'top center' : 'bottom center';
  const animationName = isFlippedDownward ? 'markerPopupAnimationDown' : 'markerPopupAnimationUp';

  const formattedStart = formatDate(dateStart);
  const formattedEnd = formatDate(dateEnd);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="glass-panel cursor-pointer rounded-xl overflow-hidden shadow-xl"
      style={{
        position: 'fixed',
        top: `${topPos}px`,
        left: `${posX}px`,
        width: '300px',
        zIndex: 1000,
        transformOrigin,
        animation: `${animationName} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <style>
        {`
          @keyframes markerPopupAnimationUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes markerPopupAnimationDown {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="p-3 flex flex-col gap-2 w-full bg-white/80 backdrop-blur-md">
        <div className="flex justify-between items-center w-full">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {category}
          </span>
          <span className="text-[10px] text-slate-400">
            {currentIndex + 1} / {totalInGroup}
          </span>
        </div>

        {imageUrl && (
          <img src={imageUrl} alt={title || 'Event'} className="w-full h-28 object-cover rounded-lg" />
        )}

        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-slate-800 truncate">{title || 'Untitled Event'}</h4>
          
          {/* Affichage propre des dates de début et de fin */}
          {(formattedStart || formattedEnd) && (
            <div className="text-[11px] text-indigo-600 font-medium">
              {formattedStart && `Du ${formattedStart}`}
              {formattedEnd && ` au ${formattedEnd}`}
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Ferme à {closingTime}</span>
            <span>{interestedUsersCount} intéressés</span>
          </div>
        </div>

        {totalInGroup > 1 && (
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-200">
            <button
              type="button"
              onClick={onPrev}
              className="px-2 py-0.5 text-xs bg-slate-200 hover:bg-slate-300 rounded cursor-pointer"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={(e) => onNext?.(e, totalInGroup - 1)}
              className="px-2 py-0.5 text-xs bg-slate-200 hover:bg-slate-300 rounded cursor-pointer"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
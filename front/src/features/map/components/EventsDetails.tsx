import React, { useMemo } from 'react';
import './EventsDetails.css';
import LikeButton from '../../events/components/LikeButton';

export interface Friend {
  id: string;
  name: string;
}

export interface EventsDetailsProps {
  eventId?: string;
  title?: string;
  isTranslating?: boolean;
  dateStart?: string;
  dateEnd?: string;
  priceType?: string;
  category?: string;
  isOpen?: boolean;
  closingTime?: string;
  interestedUsersCount?: number;
  isConnected?: boolean;
  interestedFriends?: Friend[];
  imageUrl?: string;
  position: { x: number; y: number };

  // Group Carousel Props
  totalInGroup?: number;
  currentIndex?: number;
  onPrev?: (e: React.MouseEvent) => void;
  onNext?: (e: React.MouseEvent) => void;

  // Interaction Handlers
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const CARD_HEIGHT = 250; // Estimated height of the card in px

function formatDate(value?: string) {
  if (!value) return 'Date inconnue';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventsDetails({
  eventId,
  title = 'Event Title',
  isTranslating = false,
  dateStart,
  dateEnd,
  priceType,
  category,
  interestedUsersCount = 0,
  imageUrl = '/event_image.webp',
  position,
  totalInGroup = 1,
  currentIndex = 0,
  onPrev,
  onNext,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: EventsDetailsProps) {
  const { lang } = useLanguage();

  // Check if there is enough space above the marker to show the popup
  const isFlippedDownward = useMemo(() => {
    return position.y - CARD_HEIGHT < 75; // 75px padding safety threshold from top of viewport
  }, [position.y]);

  // Adjust top offset and transform origin based on orientation
  const topPos = isFlippedDownward ? position.y : position.y - 60;

  const formattedPrice = getPriceLabel(priceType, lang);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`glass-panel events-details-popup cursor-pointer ${
        isFlippedDownward ? 'events-details-popup--down' : 'events-details-popup--up'
      }`}
      style={{
        top: `${topPos}px`,
        left: `${position.x}px`,
      }}
    >
      {/* Image & Carousel Overlay Container */}
      <div className="events-details-image-container">
        <img src={imageUrl} alt={title} className="events-details-image" />

        {/* Navigation Controls for Grouped Events */}
        {totalInGroup > 1 && (
          <div className="events-details-carousel">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="events-details-carousel-button"
            >
              ‹
            </button>
            <span className="events-details-carousel-counter">
              {currentIndex + 1} / {totalInGroup}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalInGroup - 1}
              className="events-details-carousel-button"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="events-details-content">
        {isTranslating ? (
          <div className="events-details-title-skeleton" />
        ) : (
          <h2 className="events-details-title">{title}</h2>
        )}
        <h3 className="events-details-category text-slate-600!">{category}</h3>
        <div className="events-details-meta">
          <span>{formattedPrice || 'Prix non précisé'}</span>
          <span> Debut : {formatDate(dateStart)}</span>
          <div className="events-details-end-row">
            <span> Fin : {formatDate(dateEnd)}</span>
            {eventId && (
              <LikeButton eventId={eventId} interestedUsersCount={interestedUsersCount} iconOnly />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

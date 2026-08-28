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
<<<<<<< HEAD
  
  priceDetail?: string;
  priceType?: string;
  
=======

  // Group Carousel Props
>>>>>>> dev
  totalInGroup?: number;
  currentIndex?: number;
  onPrev?: (e: React.MouseEvent) => void;
  onNext?: (e: React.MouseEvent) => void;

  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

<<<<<<< HEAD
const CARD_HEIGHT = 280;

export default function EventsDetails({
=======
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
>>>>>>> dev
  title = 'Event Title',
  dateStart,
  dateEnd,
  priceType,
  category,
  interestedUsersCount = 0,
  imageUrl = '/event_image.webp',
  position,
  priceDetail,
  priceType,
  totalInGroup = 1,
  currentIndex = 0,
  onPrev,
  onNext,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: EventsDetailsProps) {
  const isFlippedDownward = useMemo(() => {
    return position.y - CARD_HEIGHT < 75;
  }, [position.y]);

  const topPos = isFlippedDownward ? position.y : position.y - 60;

  const normalizedPrice = priceType?.trim().toLowerCase();
  const formattedPrice =
    normalizedPrice?.includes('fee-based') || normalizedPrice?.includes('payant')
      ? 'Payant'
      : normalizedPrice?.includes('free') || normalizedPrice?.includes('gratuit')
        ? 'Gratuit'
        : priceType?.trim();

  const rawPrice = priceDetail || priceType || 'Gratuit';

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
<<<<<<< HEAD
      <style>
        {`
          @keyframes markerPopupAnimationUp {
            0% { opacity: 0; transform: translate(-50%, -100%) scale(0.6); }
            100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          }
          @keyframes markerPopupAnimationDown {
            0% { opacity: 0; transform: translate(-50%, 0%) scale(0.6); }
            100% { opacity: 1; transform: translate(-50%, 0%) scale(1); }
          }
        `}
      </style>

      <div style={{ width: '100%', height: '130px', position: 'relative', padding: '10px 10px 0 10px', boxSizing: 'border-box' }}>
        <img
          src={imageUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
=======
      {/* Image & Carousel Overlay Container */}
      <div className="events-details-image-container">
        <img src={imageUrl} alt={title} className="events-details-image" />
>>>>>>> dev

        {totalInGroup > 1 && (
<<<<<<< HEAD
          <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              style={{ pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentIndex === 0 ? 'default' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            >
              ‹
            </button>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
=======
          <div className="events-details-carousel">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="events-details-carousel-button"
            >
              ‹
            </button>
            <span className="events-details-carousel-counter">
>>>>>>> dev
              {currentIndex + 1} / {totalInGroup}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalInGroup - 1}
<<<<<<< HEAD
              style={{ pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentIndex === totalInGroup - 1 ? 'default' : 'pointer', opacity: currentIndex === totalInGroup - 1 ? 0.4 : 1, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
=======
              className="events-details-carousel-button"
>>>>>>> dev
            >
              ›
            </button>
          </div>
        )}
      </div>

<<<<<<< HEAD
      <div style={{ padding: '14px 18px 18px 18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f1f1f', marginBottom: '8px', lineHeight: '1.2' }}>
          {title}
        </div>

        <div style={{ fontSize: '13px', color: '#333', marginBottom: '6px' }}>
          <span style={{ fontWeight: 600 }}>Prix : </span>
          <span dangerouslySetInnerHTML={{ __html: rawPrice }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" style={{ width: '13px', height: '13px', display: 'block' }}>
              <path d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z" fill="#FF6507" />
            </svg>
            <span style={{ fontWeight: 600, color: '#1f1f1f' }}>{interestedUsersCount}</span>
            <span>interested</span>
          </div>

          {isConnected && interestedFriends.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
              {interestedFriends.slice(0, 3).map((friend, index) => {
                const initials = friend.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={friend.id} title={friend.name} className="glass-panel" style={{ width: '26px', height: '26px', cursor: 'pointer', borderRadius: '50%', marginLeft: index > 0 ? '-8px' : '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                    {initials}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '4px' }}>
          {category}
        </div>

        <div style={{ fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: isOpen ? '#137333' : '#d93025' }}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
          <span style={{ color: '#70757a' }}> · Closes {closingTime}</span>
=======
      <div className="events-details-content">
        <h2 className="events-details-title">{title}</h2>
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
>>>>>>> dev
        </div>
      </div>
    </div>
  );
}

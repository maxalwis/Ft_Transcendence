import React, { useMemo } from 'react';

export interface Friend {
  id: string;
  name: string;
}

export interface EventsDetailsProps {
  title?: string;
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

const CARD_HEIGHT = 260; // Estimated height of the card in px

export function EventsDetails({
  title = 'Event Title',
  category = 'Category',
  isOpen = false,
  closingTime = '11:00 PM',
  interestedUsersCount = 0,
  isConnected = false,
  interestedFriends = [],
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
  // Check if there is enough space above the marker to show the popup
  const isFlippedDownward = useMemo(() => {
    return position.y - CARD_HEIGHT < 75; // 75px padding safety threshold from top of viewport
  }, [position.y]);

  // Adjust top offset and transform origin based on orientation
  const topPos = isFlippedDownward ? position.y : position.y - 60;
  const transformOrigin = isFlippedDownward ? 'top center' : 'bottom center';
  const animationName = isFlippedDownward ? 'markerPopupAnimationDown' : 'markerPopupAnimationUp';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="glassmorphism-popup cursor-pointer"
      style={{
        position: 'fixed',
        top: `${topPos}px`,
        left: `${position.x}px`,
        width: '300px',
        zIndex: 1000,
        transformOrigin,
        animation: `${animationName} 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      }}
    >
      <style>
        {`
          @keyframes markerPopupAnimationUp {
            0% {
              opacity: 0;
              transform: translate(-50%, -100%) scale(0.6);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -100%) scale(1);
            }
          }

          @keyframes markerPopupAnimationDown {
            0% {
              opacity: 0;
              transform: translate(-50%, 0%) scale(0.6);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0%) scale(1);
            }
          }
        `}
      </style>

      {/* Image & Carousel Overlay Container */}
      <div
        style={{
          width: '100%',
          height: '130px',
          position: 'relative',
          padding: '10px 10px 0 10px',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />

        {/* Navigation Controls for Grouped Events */}
        {totalInGroup > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentIndex === 0 ? 'default' : 'pointer',
                opacity: currentIndex === 0 ? 0.4 : 1,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 8px',
                borderRadius: '10px',
                backdropFilter: 'blur(4px)',
              }}
            >
              {currentIndex + 1} / {totalInGroup}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalInGroup - 1}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentIndex === totalInGroup - 1 ? 'default' : 'pointer',
                opacity: currentIndex === totalInGroup - 1 ? 0.4 : 1,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div style={{ padding: '14px 18px 18px 18px' }}>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1f1f1f',
            marginBottom: '8px',
            lineHeight: '1.2',
          }}
        >
          {title}
        </div>

        {/* Interested Users & Friends Row */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          {/* Heart + Count */}
          <div
            style={{
              fontSize: '13px',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              style={{ width: '13px', height: '13px', display: 'block' }}
            >
              <g
                style={{
                  stroke: 'none',
                  strokeWidth: 0,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'none',
                  fillRule: 'nonzero',
                  opacity: 1,
                }}
                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
              >
                <path
                  d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
                  style={{
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: 'none',
                    strokeLinecap: 'butt',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 10,
                    fill: '#FF6507',
                    fillRule: 'nonzero',
                    opacity: 1,
                  }}
                  transform=" matrix(1 0 0 1 0 0) "
                  strokeLinecap="round"
                />
              </g>
            </svg>
            <span style={{ fontWeight: 600, color: '#1f1f1f' }}>
              {interestedUsersCount}
            </span>
            <span>interested</span>
          </div>

          {/* Friends Initials Circles */}
          {isConnected && interestedFriends.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
              {interestedFriends.slice(0, 3).map((friend, index) => {
                const initials = friend.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={friend.id}
                    title={friend.name}
                    className="glassmorphism-element"
                    style={{
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      marginLeft: index > 0 ? '-8px' : '0px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category */}
        <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '4px' }}>
          {category}
        </div>

        {/* Opening Status */}
        <div style={{ fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: isOpen ? '#137333' : '#d93025' }}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
          <span style={{ color: '#70757a' }}> · Closes {closingTime}</span>
        </div>
      </div>
    </div>
  );
}
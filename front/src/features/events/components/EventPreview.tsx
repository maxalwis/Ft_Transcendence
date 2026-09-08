import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../Event.module.css';
import LikeButton from './LikeButton';

export interface Friend {
  id: string;
  name: string;
}

export interface EventDetailsProps {
  position?: { x?: number; y?: number };
  eventId?: string;
  title?: string;
  isTranslating?: boolean;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  isOpen?: boolean;
  priceType?: string;
  closingTime?: string;
  interestedUsersCount?: number;
  isConnected?: boolean;
  interestedFriends?: Friend[];
  imageUrl?: string;

  totalInGroup?: number;
  currentIndex?: number;
  onPrev?: (e?: React.MouseEvent) => void;
  onNext?: (e?: React.MouseEvent, maxIndex?: number) => void;

  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CARD_WIDTH = 300;
const MARKER_HEIGHT = 60;
const GAP = 8;

function formatDate(value?: string, locale = 'fr-FR', undefinedText = 'Undefined date') {
  if (!value) return undefinedText;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefinedText;
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DEFAULT_POSITION = { x: 0, y: 0 };

export default function EventPreview({
  position = DEFAULT_POSITION,
  eventId,
  priceType,
  title,
  isTranslating = false,
  category,
  dateStart,
  dateEnd,
  interestedUsersCount = 0,
  imageUrl = '/event_image.webp',
  totalInGroup = 1,
  currentIndex = 0,
  onPrev,
  onNext,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: EventDetailsProps) {
  const { t, i18n } = useTranslation();
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const hasValidPosition = typeof position.y === 'number' && typeof position.x === 'number';

  // Attach ResizeObserver via callback ref & disconnect old instances cleanly
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (height > 0) {
          setCardHeight((prev) => (prev === height ? prev : height));
        }
      }
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const currentLocale = useMemo(() => {
    switch (i18n.language) {
      case 'es': return 'es-ES';
      case 'en': return 'en-US';
      case 'ar': return 'ar-SA';
      default: return 'fr-FR';
    }
  }, [i18n.language]);

  const { topPos, leftPos, isFlippedDownward } = useMemo(() => {
    const posY = position.y ?? 0;
    const posX = (position.x ?? 0) - CARD_WIDTH / 2;
    const currentHeight = cardHeight ?? 300;
    const topAbove = posY - MARKER_HEIGHT - currentHeight - GAP;
    const flipped = topAbove < 0;

    const computedTop = flipped ? posY + GAP : topAbove;
    let computedLeft = posX;

    if (posX < 30) {
      computedLeft = 30;
    } else if (posX + CARD_WIDTH > window.innerWidth - 30) {
      computedLeft = window.innerWidth - CARD_WIDTH - 30;
    }

    return { topPos: computedTop, leftPos: computedLeft, isFlippedDownward: flipped };
  }, [position.x, position.y, cardHeight]);

  if (!hasValidPosition) return null;

  const handleExtendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const normalizedPrice = priceType?.trim().toLowerCase();
  const formattedPrice =
    normalizedPrice === 'payant'
      ? t('eventPreview.price.feeBased')
      : normalizedPrice?.includes('gratuit')
        ? t('eventPreview.price.free')
        : priceType?.trim() || t('eventPreview.price.unspecified');

  const undefinedDateText = t('eventPreview.undefinedDate');

  return (
    <div
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className={`glass-panel ${styles['events-details-popup']} fixed w-[300px] z-[1000] flex flex-col justify-center cursor-default ${
        cardHeight !== null ? (isFlippedDownward ? styles.popupDown : styles.popupUp) : ''
      } ${
        isFlippedDownward
          ? styles['events-details-popup--down']
          : styles['events-details-popup--up']
      }`}
      style={{
        top: `${topPos}px`,
        left: `${leftPos}px`,
        transformOrigin: isFlippedDownward ? 'top center' : 'bottom center',
        visibility: cardHeight !== null ? 'visible' : 'hidden',
      }}
    >
      <div className={styles['events-details-image-container']}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title || t('eventPreview.defaultAlt')}
            className={styles['events-details-image']}
          />
        )}
        <div
          dir="ltr"
          className="absolute top-2 left-2 right-2 flex justify-end items-center z-10 pointer-events-none"
        >
          <button
            type="button"
            onClick={handleExtendClick}
            title={t('eventPreview.seeDetails')}
            className="modal-close pointer-events-auto"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      {totalInGroup > 1 && (
        <div className="flex justify-between items-center px-3 py-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPrev) onPrev(e);
            }}
            disabled={currentIndex === 0}
            className={`${styles['events-details-carousel-button']} disabled:opacity-40`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className={styles['events-details-carousel-counter']}>
            {currentIndex + 1} / {totalInGroup}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNext) onNext(e);
            }}
            disabled={currentIndex === totalInGroup - 1}
            className={`${styles['events-details-carousel-button']} disabled:opacity-40`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      <div className={styles['events-details-content']}>
        {isTranslating ? (
          <div
            className="mb-2 h-6 w-3/4 animate-pulse rounded"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        ) : (
          <h2 className={styles['events-details-title']}>{title}</h2>
        )}
        <h3 className={`${styles['events-details-category']} text-slate-600!`}>{category}</h3>
        <div className={styles['events-details-meta']}>
          <span>{formattedPrice}</span>
          <span>
            {t('eventPreview.start')}: {formatDate(dateStart, currentLocale, undefinedDateText)}
          </span>
          <div className={styles['events-details-end-row']}>
            <span>
              {t('eventPreview.end')}: {formatDate(dateEnd, currentLocale, undefinedDateText)}
            </span>
            {Boolean(eventId) && (
              <LikeButton eventId={eventId!} interestedUsersCount={interestedUsersCount} iconOnly />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
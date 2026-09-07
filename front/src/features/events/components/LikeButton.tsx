import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import styles from '../Event.module.css';
import { useTranslation } from 'react-i18next';

interface LikeButtonProps {
  eventId: string;
  interestedUsersCount?: number;
  iconOnly?: boolean;
}

export default function LikeButton({
  eventId,
  interestedUsersCount = 0,
  iconOnly = false,
}: LikeButtonProps) {
  const storageKey = `event-liked-${eventId}`;
  const [isLiked, setIsLiked] = useState(() => localStorage.getItem(storageKey) === 'true');
  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);
  const { t } = useTranslation();

  // Reset state during render if eventId/storageKey changes
  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey);
    setIsLiked(localStorage.getItem(storageKey) === 'true');
  }

  useEffect(() => {
    const handleLikeChanged = (event: Event) => {
      const likeEvent = event as CustomEvent<{ eventId: string; isLiked: boolean }>;
      if (likeEvent.detail.eventId === eventId) {
        setIsLiked(likeEvent.detail.isLiked);
      }
    };

    const handleStorageChanged = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setIsLiked(event.newValue === 'true');
      }
    };

    window.addEventListener('event-like-changed', handleLikeChanged);
    window.addEventListener('storage', handleStorageChanged);

    return () => {
      window.removeEventListener('event-like-changed', handleLikeChanged);
      window.removeEventListener('storage', handleStorageChanged);
    };
  }, [eventId, storageKey]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    localStorage.setItem(storageKey, String(nextIsLiked));
    window.dispatchEvent(
      new CustomEvent('event-like-changed', {
        detail: { eventId, isLiked: nextIsLiked },
      })
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        className={`icon-btn ${styles['like-button']} active:zoom-80! transition-all! ${
          iconOnly ? styles['like-button--icon-only'] : ''
        }`}
        aria-label={`Mark event ${eventId} as interesting`}
        aria-pressed={isLiked}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-4 -4 98 98"
          className="h-4 w-4 shrink-0 overflow-visible"
          aria-hidden="true"
        >
          <path
            d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
            className={`transition-colors ${
              isLiked ? 'fill-red-500 stroke-red-500' : 'fill-transparent stroke-current opacity-70'
            } ${isLiked ? styles['like-button__icon--liked'] : styles['like-button__icon']}`}
            strokeWidth="6"
          />
        </svg>
      </button>
      {!iconOnly && (
        <span className="text-xs">
          {t('likeButton.interested', { count: interestedUsersCount })}
        </span>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import './LikeButton.css';

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
    <button
      type="button"
      onClick={handleClick}
      className={`like-button active:zoom-80! transition-all! ${iconOnly ? 'like-button--icon-only' : ''}`}
      aria-label={`Marquer l'événement ${eventId} comme intéressant`}
      aria-pressed={isLiked}>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 90 90"
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true">

        <path
          d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
          fill={isLiked ? '#cf2b3c' : 'none'}
          stroke={isLiked ? '#cf2b3c' : '#FF0700'}
          strokeWidth="4"/>

      </svg>
      {!iconOnly && (
        <span className="text-xs">
          {interestedUsersCount} intéressé{interestedUsersCount === 1 ? '' : 's'}
        </span>
      )}
    </button>
  );
}

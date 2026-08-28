import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useAuth } from '../../../context/auth/AuthContext';
import {
  markInterested,
  removeInterest,
  getInterestStatus,
  getInterestCount,
} from '../../../api/events-interests';
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
  const { accessToken } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(interestedUsersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);

    if (!accessToken) {
      getInterestCount(eventId)
        .then(setCount)
        .catch(() => {})
        .finally(() => setIsReady(true));
      return;
    }
    getInterestStatus(eventId, accessToken)
      .then(({ isInterested, count }) => {
        setIsLiked(isInterested);
        setCount(count);
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, [eventId, accessToken]);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!accessToken || isLoading || !isReady) return;

    const nextIsLiked = !isLiked;
    setIsLoading(true);
    setIsLiked(nextIsLiked); // optimistic update
    setCount((c) => Math.max(0, c + (nextIsLiked ? 1 : -1)));

    try {
      if (nextIsLiked) {
        await markInterested(eventId, accessToken);
      } else {
        await removeInterest(eventId, accessToken);
      }
    } catch (err) {
      // rollback en cas d'échec
      setIsLiked(!nextIsLiked);
      setCount((c) => Math.max(0, c + (nextIsLiked ? -1 : 1)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || !isReady}
      className={`like-button active:zoom-80! transition-all! ${iconOnly ? 'like-button--icon-only' : ''}`}
      aria-label={`Marquer l'événement ${eventId} comme intéressant`}
      aria-pressed={isLiked}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-4 -4 98 98"
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
          className={isLiked ? 'like-button__icon--liked' : 'like-button__icon'}
          strokeWidth="4"
        />
      </svg>
      {!iconOnly && (
        <span className="text-xs">
          {count} intéressé{count === 1 ? '' : 's'}
        </span>
      )}
    </button>
  );
}

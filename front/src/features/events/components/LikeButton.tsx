import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import styles from '../Event.module.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { useSocket } from '../../../context/socket/SocketContext';
import {
  markInterested,
  removeInterest,
  getInterestStatus,
  getInterestCount,
} from '../../../api/events-interests';

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
  const { socket, isConnected } = useSocket();
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(interestedUsersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { t } = useTranslation();

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

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = (data: { eventId: string; count: number }) => {
      if (data.eventId === eventId) {
        setCount(data.count);
      }
    };

    socket.on('interest:updated', handler);
    return () => {
      socket.off('interest:updated', handler);
    };
  }, [socket, isConnected, eventId]);

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
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || !isReady}
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
      {!iconOnly && <span className="text-xs">{t('likeButton.interested', { count })}</span>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useSocket } from '../../../context/socket/useSocket';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';
import {
  markInterested,
  removeInterest,
  getInterestStatus,
  getInterestCount,
} from '../../../api/events-interests';
import styles from '../Event.module.css';
import { useTranslation } from 'react-i18next';

interface LikeButtonProps {
  eventId: string;
  interestedUsersCount?: number;
  iconOnly?: boolean;
}

interface LikeSyncDetail {
  eventId: string;
  isLiked: boolean;
  count: number;
}

export default function LikeButton({
  eventId,
  interestedUsersCount = 0,
  iconOnly = false,
}: LikeButtonProps) {
  const { accessToken } = useAuth();
  const { socket, isConnected } = useSocket();
  const { showWarning } = useNotification();
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(interestedUsersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { t } = useTranslation();

  const broadcastChange = (nextIsLiked: boolean, nextCount: number) => {
    window.dispatchEvent(
      new CustomEvent<LikeSyncDetail>('like-button-updated', {
        detail: { eventId, isLiked: nextIsLiked, count: nextCount },
      })
    );
  };

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<LikeSyncDetail>;
      if (customEvent.detail && customEvent.detail.eventId === eventId) {
        setIsLiked(customEvent.detail.isLiked);
        setCount(customEvent.detail.count);
      }
    };

    window.addEventListener('like-button-updated', handleSync);
    return () => {
      window.removeEventListener('like-button-updated', handleSync);
    };
  }, [eventId]);

  useEffect(() => {
    let isCancelled = false;

    if (!accessToken) {
      getInterestCount(eventId)
        .then((fetchedCount) => {
          if (!isCancelled) setCount(fetchedCount);
        })
        .catch(() => {})
        .finally(() => {
          if (!isCancelled) setIsReady(true);
        });
    } else {
      getInterestStatus(eventId, accessToken)
        .then(({ isInterested, count: fetchedCount }) => {
          if (!isCancelled) {
            setIsLiked(isInterested);
            setCount(fetchedCount);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!isCancelled) setIsReady(true);
        });
    }

    return () => {
      isCancelled = true;
    };
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

    if (!accessToken) {
      showWarning(t('likeButton.loginRequired'));
      return;
    }

    if (isLoading || !isReady) return;

    const nextIsLiked = !isLiked;
    const nextCount = Math.max(0, count + (nextIsLiked ? 1 : -1));

    setIsLoading(true);

    setIsLiked(nextIsLiked);
    setCount(nextCount);
    broadcastChange(nextIsLiked, nextCount);

    try {
      if (nextIsLiked) {
        await markInterested(eventId, accessToken);
      } else {
        await removeInterest(eventId, accessToken);
      }
    } catch {
      const rollbackIsLiked = !nextIsLiked;
      const rollbackCount = Math.max(0, nextCount + (nextIsLiked ? -1 : 1));

      setIsLiked(rollbackIsLiked);
      setCount(rollbackCount);
      broadcastChange(rollbackIsLiked, rollbackCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-flex gap-1.5">
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

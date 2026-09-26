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
import Button from '../../../components/ui/Button';
import { LikeIcon } from '../../../types/icons';

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
    <div className="inline-flex gap-1.5 items-center">
      <Button
        variant="icon"
        type="button"
        onClick={handleClick}
        disabled={isLoading || !isReady}
        className={`${styles['like-button']} active:zoom-80! transition-all! ${
          iconOnly ? styles['like-button--icon-only'] : ''
        }`}
        aria-label={`Mark event ${eventId} as interesting`}
        aria-pressed={isLiked}
      >
        <LikeIcon liked={isLiked} className="h-4 w-4" />
      </Button>

      {!iconOnly && <span className="text-xs">{t('likeButton.interested', { count })}</span>}
    </div>
  );
}

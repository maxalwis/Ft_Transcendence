import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PendingRequest } from '../../../api/friends';
import { acceptFriendRequest, rejectFriendRequest } from '../../../api/friends';
import { useAuth } from '../../../context/auth/useAuth';
import styles from '../Friends.module.css';

type FriendsRequestsProps = {
  requests: PendingRequest[];
  onDataChanged: () => void;
};

export default function FriendsRequests({ requests, onDataChanged }: FriendsRequestsProps) {
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const handleAccept = async (senderId: number) => {
    try {
      await acceptFriendRequest(senderId, accessToken!);
      setErrorMsg(null);
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('friendsRequests.errors.acceptFailed'));
    }
  };

  const handleReject = async (senderId: number) => {
    try {
      await rejectFriendRequest(senderId, accessToken!);
      setErrorMsg(null);
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('friendsRequests.errors.rejectFailed'));
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="mb-3 text-xs text-slate-400 italic text-center">
        {t('friendsRequests.noPendingRequests')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
      {requests.map((req) => {
        const senderObj =
          'sender' in req
            ? (req as { sender?: { username?: string; id?: number } }).sender
            : undefined;
        const targetId = req.senderId || senderObj?.id || req.id;
        const displayName =
          senderObj?.username || t('friendsRequests.fallbackUser', { id: targetId });

        return (
          <div
            key={req.id}
            className="flex items-center justify-between gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-black"
          >
            <span className="font-medium">{displayName}</span>
            <div className="flex">
              <button
                type="button"
                onClick={() => handleAccept(targetId)}
                className={`${styles.menuButton} ${styles.menuButtonGreen}`}
              >
                {t('friendsRequests.accept')}
              </button>
              <button
                type="button"
                onClick={() => handleReject(targetId)}
                className={`${styles.menuButton} ${styles.menuButtonRed}`}
              >
                {t('friendsRequests.reject')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

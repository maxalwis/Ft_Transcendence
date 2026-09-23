import { useTranslation } from 'react-i18next';
import type { PendingRequest } from '../../../api/friends';
import { acceptFriendRequest, rejectFriendRequest } from '../../../api/friends';
import { useNotification } from '../../../context/notifications/useNotification';

type FriendsRequestsProps = {
  requests: PendingRequest[];
  onDataChanged: () => void;
  onBack?: () => void;
};

export default function FriendsRequests({ requests, onDataChanged, onBack }: FriendsRequestsProps) {
  const { t } = useTranslation();
  const { showWarning } = useNotification();

  const handleAccept = async (senderId: number) => {
    try {
      await acceptFriendRequest(senderId);
      onDataChanged();
    } catch (err) {
      showWarning(err instanceof Error ? err.message : t('friendsRequests.errors.acceptFailed'));
    }
  };

  const handleReject = async (senderId: number) => {
    try {
      await rejectFriendRequest(senderId);
      onDataChanged();
    } catch (err) {
      showWarning(err instanceof Error ? err.message : t('friendsRequests.errors.rejectFailed'));
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-2">
        {' '}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to friends"
          className="modal-button modal-back self-start"
        >
          {' '}
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {' '}
            <path d="M15 18l-6-6 6-6" />{' '}
          </svg>{' '}
        </button>{' '}
        <div className="text-xs text-slate-400 italic text-center">
          {' '}
          {t('friendsRequests.noPendingRequests')}{' '}
        </div>{' '}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {' '}
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to friends"
        className="modal-button modal-back self-start"
      >
        {' '}
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {' '}
          <path d="M15 18l-6-6 6-6" />{' '}
        </svg>{' '}
      </button>
      {requests.map((req) => {
        const senderObj = req.sender;
        const targetId = req.senderId || senderObj.id || req.id;

        const displayName =
          senderObj.username || t('friendsRequests.fallbackUser', { id: targetId });

        const displayPhoto = senderObj.avatar;

        return (
          <div key={req.id} className="flex items-center justify-between gap-1 px-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-600 text-xs font-semibold text-white">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <span className="truncate">{displayName}</span>
            </div>
            <div className="flex">
              <button type="button" onClick={() => handleAccept(targetId)} className={`menuButton`}>
                {t('friendsRequests.accept')}
              </button>
              <button type="button" onClick={() => handleReject(targetId)} className={`menuButton`}>
                {t('friendsRequests.reject')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

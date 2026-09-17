import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';
import { useTranslation } from 'react-i18next';

import { getFriends, getPendingRequests } from '../../../api/friends';
import type { User, PendingRequest } from '../../../api/friends';

import FriendsContent from './FriendsContent';
import FriendsModal from './FriendsModal';

export type FriendAction = 'menu' | 'default' | 'add' | 'remove' | 'request';

export type ActionState = {
  action: FriendAction;
};

export type OpenState = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

interface FriendsProps {
  embedded?: boolean;
  onBack?: () => void;
}

export default function Friends({ embedded = false, onBack }: FriendsProps) {
  const [action, setAction] = useState<FriendAction>('menu');
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);

  const { showWarning } = useNotification();
  const { t } = useTranslation();
  const { user, accessToken } = useAuth();

  const loadData = useCallback(async () => {
    if (!accessToken) return;

    try {
      const [friendsList, pendingList] = await Promise.all([
        getFriends(accessToken),
        getPendingRequests(accessToken),
      ]);

      setFriends(friendsList);
      setRequests(pendingList);
    } catch (err) {
      showWarning(
        err instanceof Error ? err.message : t('friends.errorLoading', 'Error loading friends.')
      );
    }
  }, [accessToken, showWarning, t]);

  const handleClick = () => {
    setAction('menu');
    setIsOpen(true);

    if (user && accessToken) {
      loadData();
    }
  };

  return (
    <div className={embedded ? 'w-full' : 'relative'}>
      {!embedded && (
        <button
          type="button"
          className="glass-panel flex items-center justify-center whitespace-nowrap"
          onClick={handleClick}
        >
          {t('friends.buttonTitle', 'Friends')}
        </button>
      )}

      {embedded ? (
        <FriendsContent
          action={action}
          setAction={setAction}
          friends={friends}
          requests={requests}
          onDataChanged={loadData}
          isLoggedIn={!!user}
          onBack={onBack}
        />
      ) : (
        <FriendsModal
          action={action}
          setAction={setAction}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          friends={friends}
          requests={requests}
          onDataChanged={loadData}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
}

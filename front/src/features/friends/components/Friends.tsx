import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';
import { useTranslation } from 'react-i18next';

import { getFriends, getPendingRequests, removeFriend } from '../../../api/friends';
import type { User, PendingRequest } from '../../../api/friends';
import { useSocket } from '../../../context/socket/useSocket';

import FriendsContent from './FriendsContent';
import FriendsModal from './FriendsModal';

export type OpenState = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

interface FriendsProps {
  embedded?: boolean;
  onBack?: () => void;
}

export default function Friends({ embedded = false, onBack }: FriendsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);

  const { showWarning } = useNotification();
  const { t } = useTranslation();
  const { user, accessToken } = useAuth();
  const { socket } = useSocket();

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

  const handleRemoveFriend = async (friendId: number) => {
    if (!accessToken) return;

    try {
      await removeFriend(friendId, accessToken);
      await loadData();
    } catch (err) {
      showWarning(
        err instanceof Error
          ? err.message
          : t('friends.errors.removeFailed', 'Error during removal.')
      );
    }
  };

  const handleClick = () => {
    setIsOpen(true);

    if (user && accessToken) {
      loadData();
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleFriendUpdate = () => {
      loadData();
    };

    socket.on('friend:updated', handleFriendUpdate);

    return () => {
      socket.off('friend:updated', handleFriendUpdate);
    };
  }, [socket, loadData]);

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = () => {
      loadData();
    };

    socket.on('friend:request:new', handleFriendRequest);

    return () => {
      socket.off('friend:request:new', handleFriendRequest);
    };
  }, [socket, loadData]);

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
          friends={friends}
          requests={requests}
          onDataChanged={loadData}
          onRemoveFriend={handleRemoveFriend}
          isLoggedIn={!!user}
          onBack={onBack}
        />
      ) : (
        <FriendsModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          friends={friends}
          requests={requests}
          onDataChanged={loadData}
          onRemoveFriend={handleRemoveFriend}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
}

import FriendsSidebar from './FriendsSidebar';
import { getFriends, getPendingRequests } from '../../../api/friends';
import type { User, PendingRequest } from '../../../api/friends';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/auth/useAuth';
import { useTranslation } from 'react-i18next';

export type FriendAction = 'menu' | 'default' | 'add' | 'remove' | 'request';

export type ActionState = {
  action: FriendAction;
};

export type OpenState = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

interface FriendsProps {
  onOpenAuth?: () => void;
}

export default function Friends({ onOpenAuth }: FriendsProps) {
  const [action, setAction] = useState<FriendAction>('menu');
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : t('friends.errorLoading', 'Erreur de chargement.')
      );
    }
  }, [accessToken, t]);

  useEffect(() => {
    let active = true;

    if (isOpen && user && accessToken) {
      (async () => {
        try {
          const [friendsList, pendingList] = await Promise.all([
            getFriends(accessToken),
            getPendingRequests(accessToken),
          ]);
          if (active) {
            setFriends(friendsList);
            setRequests(pendingList);
            setErrorMsg(null);
          }
        } catch (err) {
          if (active) {
            setErrorMsg(
              err instanceof Error
                ? err.message
                : t('friends.errorLoading', 'Erreur de chargement.')
            );
          }
        }
      })();
    }

    return () => {
      active = false;
    };
  }, [isOpen, accessToken, user, t]);

  const handleClick = () => {
    setAction('menu');
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="glass-panel flex items-center justify-center whitespace-nowrap"
        onClick={handleClick}
      >
        {t('friends.buttonTitle', 'Friends')}
      </button>

      <FriendsSidebar
        action={action}
        setAction={setAction}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        friends={friends}
        requests={requests}
        errorMsg={errorMsg}
        onDataChanged={loadData}
        isLoggedIn={!!user}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}

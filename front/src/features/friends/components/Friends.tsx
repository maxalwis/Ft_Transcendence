import FriendsSidebar from './FriendsSidebar';
import { getFriends, getPendingRequests } from '../../../api/friends';
import type { User, PendingRequest } from '../../../api/friends';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/auth/AuthContext';
import { useTranslation } from 'react-i18next';
import styles from '../Friends.module.css';

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

  const loadData = async () => {
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
      setErrorMsg(err instanceof Error ? err.message : t('friends.errorLoading', 'Erreur de chargement.'));
    }
  };

  useEffect(() => {
    // Only load data if the user is authenticated
    if (isOpen && user) loadData();
  }, [isOpen, accessToken, user]);

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
import FriendsSidebar from './FriendsSidebar';
import { getFriends, getPendingRequests } from '../../../api/friends';
import type { User, PendingRequest } from '../../../api/friends';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../Friends.module.css';

export type FriendAction = 'menu' | 'default' | 'add' | 'remove' | 'request';

export type ActionState = {
  action: FriendAction;
};

export type OpenState = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Friends() {
  const [action, setAction] = useState<FriendAction>('menu');
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!accessToken) return;
    try {
      const [friendsList, pendingList] = await Promise.all([
        getFriends(accessToken),
        getPendingRequests(accessToken)
      ]);
      setFriends(friendsList);
      setRequests(pendingList);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de chargement.');
    }
  };

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, accessToken]);

  return (
    <div className={styles.friendsContainer}>
      {/* whitespace-nowrap keeps button text on a single line */}
      <button
        className="glass-panel p-2 cursor-pointer duration-500 active:scale-70 whitespace-nowrap"
        onClick={() => {
          if (!user) {
            navigate('/login');
            return;
          }
          setAction('menu');
          setIsOpen(true);
        }}
      >
        Friends
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
      />
    </div>
  );
}

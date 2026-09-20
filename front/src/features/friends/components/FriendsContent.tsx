import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FriendsList from './FriendsList';
import FriendsRequests from './FriendRequests';
import FriendsSearchBar from './FriendsSearchBar';
import type { FriendAction } from './Friends';
import type { User, PendingRequest } from '../../../api/friends';
import styles from '../Friends.module.css';

interface FriendsContentProps {
  action: FriendAction;
  setAction: React.Dispatch<React.SetStateAction<FriendAction>>;
  friends: User[];
  requests: PendingRequest[];
  onDataChanged: () => void;
  isLoggedIn: boolean;
  onBack?: () => void;
}

export default function FriendsContent({
  action,
  setAction,
  friends,
  requests,
  onDataChanged,
  isLoggedIn,
  onBack,
}: FriendsContentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const filteredFriends = friends.filter((friend) =>
    (friend?.username || '').toLowerCase().includes(input.toLowerCase().trim())
  );

  const handleBack = () => {
    setInput('');

    if (action !== 'menu') {
      setAction('menu');
    } else {
      onBack?.();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-sm font-medium">{t('friendsModal.notLoggedIn')}</p>
      </div>
    );
  }

  return (
    <>
      {action !== 'menu' && (
        <button
          type="button"
          aria-label="Back"
          className="modal-close left-3 right-auto"
          onClick={handleBack}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className={`flex-1 overflow-y-auto ${action !== 'menu' ? 'pt-12' : 'pt-2'}`}>
        {action === 'menu' ? (
          <div className="flex flex-col gap-2 py-2">
            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonBlue}`}
              onClick={() => setAction('default')}
            >
              {t('friendsModal.friendlist')}
            </button>

            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonOrange}`}
              onClick={() => setAction('request')}
            >
              {t('friendsModal.pendingRequests', {
                count: requests.length,
              })}
            </button>

            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonGreen}`}
              onClick={() => setAction('add')}
            >
              {t('friendsModal.add')}
            </button>

            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonRed}`}
              onClick={() => setAction('remove')}
            >
              {t('friendsModal.remove')}
            </button>
          </div>
        ) : action === 'request' ? (
          <FriendsRequests requests={requests} onDataChanged={onDataChanged} />
        ) : (
          <FriendsList
            friends={action === 'add' ? friends : filteredFriends}
            action={action}
            input={input}
            setInput={setInput}
            onDataChanged={onDataChanged}
          />
        )}
      </div>

      {action !== 'menu' && (
        <div className="glass-panel">
          <FriendsSearchBar action={action} input={input} setInput={setInput} />
        </div>
      )}
    </>
  );
}

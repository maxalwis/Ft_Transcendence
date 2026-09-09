import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FriendsList from './FriendsList';
import FriendsRequests from './FriendRequests';
import FriendsSearchBar from './FriendsSearchBar';
import type { FriendAction, OpenState } from './Friends';
import type { User, PendingRequest } from '../../../api/friends';
import styles from '../Friends.module.css';

type FriendsSidebarProps = OpenState & {
  action: FriendAction;
  setAction: React.Dispatch<React.SetStateAction<FriendAction>>;
  friends: User[];
  requests: PendingRequest[];
  errorMsg: string | null;
  onDataChanged: () => void;
  isLoggedIn: boolean;
};

export default function FriendsSidebar({
  action,
  setAction,
  isOpen,
  setIsOpen,
  friends,
  requests,
  onDataChanged,
  isLoggedIn,
}: FriendsSidebarProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Track previous props to update state synchronously during render
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevAction, setPrevAction] = useState(action);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setShouldRender(true);
    }
  }

  if (action !== prevAction) {
    setPrevAction(action);
    setInput('');
  }

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  const filteredFriends = (friends || []).filter((friend) =>
    (friend?.name || '').toLowerCase().includes(input.toLowerCase().trim())
  );

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAction('menu');
  };

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      onAnimationEnd={handleAnimationEnd}
      className={`glass-panel absolute bottom-0 left-0 flex flex-col rounded-xl overflow-hidden ${styles.sidebarModal}`}
    >
      {/* Back Arrow Button (Top-Left) */}
      {isLoggedIn && action !== 'menu' && (
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

      {/* Close Button (Top-Right) */}
      <button type="button" aria-label="Close" className="modal-close" onClick={handleClose}>
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-y-auto ${!isLoggedIn ? 'pt-8' : action !== 'menu' ? 'pt-12' : 'pt-2'}`}
      >
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-sm font-medium">{t('friendsSidebar.notLoggedIn')}</p>
          </div>
        ) : action === 'menu' ? (
          <div className="flex flex-col gap-2 py-2">
            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonBlue}`}
              onClick={() => setAction('default')}
            >
              {t('friendsSidebar.search')}
            </button>
            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonOrange}`}
              onClick={() => setAction('request')}
            >
              {t('friendsSidebar.pendingRequests', { count: requests.length })}
            </button>
            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonGreen}`}
              onClick={() => setAction('add')}
            >
              {t('friendsSidebar.add')}
            </button>
            <button
              type="button"
              className={`${styles.menuButton} ${styles.menuButtonRed}`}
              onClick={() => setAction('remove')}
            >
              {t('friendsSidebar.remove')}
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

      {/* Search Bar */}
      {isLoggedIn && action !== 'menu' && (
        <div className="glass-panel">
          <FriendsSearchBar action={action} input={input} setInput={setInput} />
        </div>
      )}
    </div>
  );
}

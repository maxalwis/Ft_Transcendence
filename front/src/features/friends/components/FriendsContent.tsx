import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FriendsList from './FriendsList';
import FriendsRequests from './FriendRequests';
import FriendsSearchBar from './FriendsSearchBar';
import FriendsSearchResults from './FriendsSearchResults';
import type { User, PendingRequest } from '../../../api/friends';
import ViewProfile from '../../profile/components/ViewProfile';

interface FriendsContentProps {
  friends: User[];
  requests: PendingRequest[];
  onDataChanged: () => void;
  onRemoveFriend: (friendId: number) => Promise<void>;
  isLoggedIn: boolean;
  onBack?: () => void;
}

export default function FriendsContent({
  friends,
  requests,
  onDataChanged,
  onRemoveFriend,
  isLoggedIn,
  onBack,
}: FriendsContentProps) {
  const { t } = useTranslation();

  const [input, setInput] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  const handleBack = () => {
    setInput('');

    if (showRequests) {
      setShowRequests(false);
      return;
    }

    onBack?.();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <p className="text-sm font-medium">{t('friendsModal.notLoggedIn')}</p>
      </div>
    );
  }

  return (
    <>
      {showRequests && (
        <button
          type="button"
<<<<<<< HEAD
          aria-label="Back"
          className="modal-button modal-close left-3 right-auto"
=======
          aria-label={t('friendsModal.back', 'Back')}
          className="modal-close left-3 right-auto"
>>>>>>> c29598b ([FE] Unified Friends modal into a single menu)
          onClick={handleBack}
        >
          <svg
            className="h-4 w-4"
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

      <div className={`flex-1 overflow-y-auto ${showRequests ? 'pt-12' : 'pt-2'}`}>
        {showRequests ? (
          <FriendsRequests requests={requests} onDataChanged={onDataChanged} />
        ) : input.trim() ? (
          <FriendsSearchResults
            input={input}
            friends={friends}
            onDataChanged={onDataChanged}
            onSelectFriend={setSelectedFriend}
          />
        ) : (
          <FriendsList friends={friends} onSelectFriend={setSelectedFriend} />
        )}
      </div>

      {!showRequests && (
        <>
          {requests.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRequests(true)}
              className="px-3 py-2 text-center text-xs font-medium text-black/70 transition hover:text-black"
            >
              {t('friendsModal.pendingRequests', {
                count: requests.length,
              })}
            </button>
          )}

          <div className="glass-panel">
            <FriendsSearchBar input={input} setInput={setInput} />
          </div>
        </>
      )}

      {selectedFriend && (
        <ViewProfile
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onRemove={onRemoveFriend}
        />
      )}
    </>
  );
}

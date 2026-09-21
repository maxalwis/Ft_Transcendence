import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FriendAction } from './Friends';
import { sendFriendRequest, removeFriend } from '../../../api/friends';
import type { User } from '../../../api/friends';
import { searchUsers } from '../../../api/users';
import type { UserSearchResult } from '../../../api/users';
import { useAuth } from '../../../context/auth/useAuth';
import ViewProfile from '../../profile/components/ViewProfile';
import styles from '../Friends.module.css';
import { useNotification } from '../../../context/notifications/useNotification';

type FriendsListProps = {
  friends: User[];
  action: FriendAction;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onDataChanged: () => void;
};

export default function FriendsList({
  friends = [],
  action,
  input,
  setInput,
  onDataChanged,
}: FriendsListProps) {
  const { showWarning } = useNotification();
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const { accessToken } = useAuth();
  const { t } = useTranslation();

  // Reset results synchronously during render when input or action isn't valid for search
  const shouldSearch = action === 'add' && Boolean(input.trim());
  
  useEffect(() => {
  if (!shouldSearch) {
    setResults([]);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      const found = await searchUsers(input, accessToken!);
      setResults(found);
    } catch {
      setResults([]);
    }
  }, 300);

  return () => clearTimeout(timeout);
}, [input, shouldSearch, accessToken]);

  const handleAddFriend = async (receiverId: number) => {
    try {
      await sendFriendRequest(receiverId, accessToken!);
      setInput('');
      setResults([]);
      onDataChanged();
    } catch (err) {
      showWarning(
        err instanceof Error ? err.message : t('friends.errors.sendFailed', 'Error during sending.')
      );
    }
  };

  const handleRemoveFriend = async (_friendId: number) => {
    try {
      await removeFriend(_friendId, accessToken!);
      onDataChanged();
    } catch (err) {
      showWarning(
        err instanceof Error
          ? err.message
          : t('friends.errors.removeFailed', 'Error during removal.')
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {action === 'add' && (
        <div className="flex flex-col gap-1">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-3 py-2 rounded-full text-sm text-black"
            >
              <span>{user?.username || 'Inconnu'}</span>
              <button
                type="button"
                onClick={() => handleAddFriend(user.id)}
                className="modal-button modal-close-inline modal-button modal-close-inline-green icon-btn shrink-0 cursor-pointer active:scale-70"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          ))}
          {input.trim() && results.length === 0 && (
            <p className="flex justify-center items-center text-xs text-slate-400 italic px-2">
              {t('friendsList.noUsersFound', 'No users found.')}
            </p>
          )}
        </div>
      )}
      {action !== 'add' &&
        (friends || []).map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-black"
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-white">
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    friend.username?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                    friend?.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <span>{friend?.username || 'Inconnu'}</span>
            </div>
            {action === 'remove' && (
              <button
                type="button"
                onClick={() => handleRemoveFriend(friend.id)}
                className="modal-button modal-close-inline modal-button modal-close-inline-red icon-btn shrink-0 cursor-pointer active:scale-70"
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
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {action !== 'remove' && (
              <button
                type="button"
                onClick={() => setSelectedFriend(friend)}
                className={`${styles.menuButton} ${styles.menuButtonBlue}`}
              >
                {t('friendsList.viewProfile')}
              </button>
            )}
          </div>
        ))}
      {selectedFriend && (
        <ViewProfile friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
      )}
    </div>
  );
}

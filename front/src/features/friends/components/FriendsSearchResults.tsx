import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../../../api/friends';
import type { UserSearchResult } from '../../../api/users';
import { searchUsers } from '../../../api/users';
import { sendFriendRequest } from '../../../api/friends';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';

type FriendsSearchResultsProps = {
  input: string;
  friends: User[];
  onDataChanged: () => void;
  onSelectFriend: (friend: User) => void;
};

export default function FriendsSearchResults({
  input,
  friends,
  onDataChanged,
  onSelectFriend,
}: FriendsSearchResultsProps) {
  const { accessToken } = useAuth();
  const { showWarning } = useNotification();
  const { t } = useTranslation();

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);

  useEffect(() => {
    const query = input.trim();

    if (!query || !accessToken) {
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const found = await searchUsers(query, accessToken);

        if (!cancelled) {
          setResults(found);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [input, accessToken]);

  const handleAddFriend = async (userId: number) => {
    if (!accessToken || sendingRequest !== null) return;

    try {
      setSendingRequest(userId);

      await sendFriendRequest(userId);

      onDataChanged();
    } catch (err) {
      showWarning(
        err instanceof Error ? err.message : t('friends.errors.sendFailed', 'Error during sending.')
      );
    } finally {
      setSendingRequest(null);
    }
  };

  if (!input.trim()) {
    return null;
  }

  if (loading) {
    return (
      <p className="flex items-center justify-center px-4 py-4 text-xs italic text-slate-400">
        {t('friendsList.searching', 'Searching...')}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="flex items-center justify-center px-4 py-4 text-xs italic text-slate-400">
        {t('friendsList.noUsersFound', 'No users found.')}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {results.map((user) => {
          const isFriend = friends.some((friend) => friend.id === user.id);

          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-black"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-600 text-xs font-semibold text-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      user.username?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>

                  <div
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                      user.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>

                <span className="truncate">{user.username || 'Inconnu'}</span>
              </div>

              {isFriend ? (
                <button
                  type="button"
                  onClick={() => onSelectFriend(user as User)}
                  className="shrink-0 text-xs font-medium text-black/70 hover:text-black"
                >
                  {t('friendsList.viewProfile', 'View Profile')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={sendingRequest === user.id}
                  onClick={() => handleAddFriend(user.id)}
                  className="modal-close-inline modal-close-inline-green icon-btn shrink-0 cursor-pointer active:scale-70 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t('friends.addFriend', 'Add friend')}
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
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../../../api/friends';
import type { UserSearchResult } from '../../../api/users';
import { searchUsers } from '../../../api/users';
import { sendFriendRequest } from '../../../api/friends';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import EmptyState from '../../../components/ui/EmptyState';
import { useApiErrorMessage } from '../../../hooks/useApiErrorMessage';

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
  const errorMessage = useApiErrorMessage();
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

        const found = await searchUsers(query);

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
      showWarning(errorMessage(err, t('friends.errors.sendFailed', 'Error during sending.')));
    } finally {
      setSendingRequest(null);
    }
  };

  if (!input.trim()) {
    return null;
  }

  if (loading) {
    return <EmptyState italic>{t('friendsList.searching', 'Searching...')}</EmptyState>;
  }

  if (results.length === 0) {
    return <EmptyState italic>{t('friendsList.noUsersFound', 'No users found.')}</EmptyState>;
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
                    <Avatar
                      avatar={user.avatar}
                      username={user.username}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div
                    className={`absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full ${
                      user.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>

                <span className="truncate">{user.username || 'Inconnu'}</span>
              </div>

              {isFriend ? (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onSelectFriend(user as User)}
                  className="shrink-0 !px-2 !py-1 text-xs font-medium text-black/70 hover:text-black"
                >
                  {t('friendsList.viewProfile', 'View Profile')}
                </Button>
              ) : (
                <Button
                  variant="icon"
                  type="button"
                  disabled={sendingRequest === user.id}
                  onClick={() => handleAddFriend(user.id)}
                  className="modal-close-inline modal-close-inline-green shrink-0 cursor-pointer active:scale-70 disabled:cursor-not-allowed disabled:opacity-50"
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
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

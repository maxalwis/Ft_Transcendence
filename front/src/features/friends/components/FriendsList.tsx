import { useState, useEffect } from 'react';
import type { FriendAction } from './Friends';
import { sendFriendRequest, removeFriend } from '../../../api/friends';
import type { User } from '../../../api/friends';
import { searchUsers } from '../../../api/users';
import type { UserSearchResult } from '../../../api/users';
import { useAuth } from '../../../context/auth/AuthContext';
import ViewProfile from '../../profile/ViewProfile';
import { useTranslation } from 'react-i18next';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const { accessToken } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (action !== 'add' || !input.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const found = await searchUsers(input, accessToken!);
        setResults(found);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Searching error.');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, action, accessToken]);

  const handleAddFriend = async (receiverId: number) => {
    setErrorMsg(null);
    try {
      await sendFriendRequest(receiverId, accessToken!);
      setInput('');
      setResults([]);
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error during sending.');
    }
  };

  const handleRemoveFriend = async (_friendId: number) => {
    try {
      await removeFriend(_friendId, accessToken!);
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error during removal.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {action === 'add' && (
        <div className="flex flex-col gap-1 px-2 py-1">
          {errorMsg && <p className="text-xs text-red-500 px-2">{errorMsg}</p>}
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-3 py-2 rounded-full text-sm text-black"
            >
              <span>{user?.username || 'Inconnu'}</span>
              <button
                type="button"
                onClick={() => handleAddFriend(user.id)}
                className="flex h-6 w-6 text-lg shrink-0 items-center border border-green-500 justify-center rounded-full duration-150
                  cursor-pointer hover:bg-green-500 hover:text-white"
              >
                +
              </button>
            </div>
          ))}
          {input.trim() && results.length === 0 && (
            <p className="text-xs text-slate-400 italic px-2">Aucun utilisateur trouvé.</p>
          )}
        </div>
      )}
      {action !== 'add' &&
        (friends || []).map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/10 px-2 py-1 text-sm text-black"
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
                className="flex h-5 w-5 items-center justify-center text-red-500 rounded-full border hover:border-white/10 hover:bg-red-600 hover:text-white duration-150 cursor-pointer"
              >
                X
              </button>
            )}
            {action !== 'remove' && (
              <button
                type="button"
                onClick={() => setSelectedFriend(friend)}
                className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs hover:bg-white/20"
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

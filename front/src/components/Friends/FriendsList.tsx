/* import { useState, useEffect } from 'react';
import type { FriendAction } from './Friends';
/* import AddFriends from './Functionalities/AddFriends';
import RemoveFriends from './Functionalities/RemoveFriends'; */
/* import type { User } from '../../api/friends';
import { sendFriendRequest } from '../../api/friends';
import { searchUsers } from '../../api/users';
import type { UserSearchResult } from '../../api/users';

type FriendsListProps = {
  friends: User[];
  action: FriendAction;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onDataChanged: () => void;
};

export default function FriendsList({
  friends,
  action,
  input,
  setInput,
  onDataChanged,
}: FriendsListProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    if (action !== 'add' || !input.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const found = await searchUsers(input);
        setResults(found);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Erreur de recherche.');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, action]);

  const handleAddFriend = async (receiverId: number) => {
    setErrorMsg(null);
    try {
      await sendFriendRequest(receiverId);
      setInput('');
      setResults([]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      // TODO: appeler removeFriend(friendId) une fois l'endpoint DELETE ajouté côté backend
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {action === 'add' && (
        <div className="flex items-center justify-between px-5 py-3 border border-green-500 rounded-full text-sm text-black text-lg">
          {errorMsg && <p className="text-xs text-red-500 px-2">{errorMsg}</p>}
          <span>{`Add: ${input}`}</span>
          <button
            onClick={() => handleAddFriend(user.id)}
            disabled={!input}
            className="flex h-6 w-6 text-lg shrink-0 items-center border border-green-500 justify-center rounded-full duration-150
						disabled:opacity-40 disabled:cursor-not-allowed
						cursor-pointer hover:bg-green-500 hover:text-white"
          >
            +
          </button>
        </div>
      )}
      {action !== 'add' &&
        friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/10 px-2 py-1 text-sm text-black"
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-white">
                  {friend.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-500 bg-green-500" />
              </div>
              <span>{friend}</span>
            </div>
            {action === 'remove' && (
              <button
                onClick={() => handleRemoveFriend(friend)}
                className="flex h-5 w-5 items-center justify-center text-red-500 rounded-full border hover:border-white/10 hover:bg-red-600 hover:text-white duration-150 cursor-pointer"
              >
                X
              </button>
            )}
          </div>
        ))}
    </div>
  );
} */

import { useState, useEffect } from 'react';
import type { FriendAction } from './Friends';
import type { User } from '../../api/friends';
import { sendFriendRequest } from '../../api/friends';
import { searchUsers } from '../../api/users';
import type { UserSearchResult } from '../../api/users';

type FriendsListProps = {
  friends: User[];
  action: FriendAction;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onDataChanged: () => void;
};

export default function FriendsList({
  friends,
  action,
  input,
  setInput,
  onDataChanged,
}: FriendsListProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    if (action !== 'add' || !input.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const found = await searchUsers(input);
        setResults(found);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Erreur de recherche.');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, action]);

  const handleAddFriend = async (receiverId: number) => {
    setErrorMsg(null);
    try {
      await sendFriendRequest(receiverId);
      setInput('');
      setResults([]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      // TODO: appeler removeFriend(friendId) une fois l'endpoint DELETE ajouté côté backend
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
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
              className="flex items-center justify-between px-3 py-2 border border-green-500 rounded-full text-sm text-black"
            >
              <span>{user.name}</span>
              <button
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
        friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/10 px-2 py-1 text-sm text-black"
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-white">
                  {friend.name.charAt(0)}
                </div>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-500 ${
                    friend.status === 'ONLINE'
                      ? 'bg-green-500'
                      : friend.status === 'IN_GAME'
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                  }`}
                />
              </div>
              <span>{friend.name}</span>
            </div>
            {action === 'remove' && (
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="flex h-5 w-5 items-center justify-center text-red-500 rounded-full border hover:border-white/10 hover:bg-red-600 hover:text-white duration-150 cursor-pointer"
              >
                X
              </button>
            )}
          </div>
        ))}
    </div>
  );
}

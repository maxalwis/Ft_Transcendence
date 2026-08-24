import type { FriendAction } from './Friends';
import AddFriends from './Functionalities/AddFriends';
import RemoveFriends from './Functionalities/RemoveFriends';

type FriendsListProps = {
  friends: string[];
  action: FriendAction;
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function FriendsList({
  friends,
  action,
  setFriends,
  input,
  setInput,
}: FriendsListProps) {
  const handleAddFriend = (friendName: string) => {
    AddFriends(friendName, setFriends);
    setInput('');
  };

  const handleRemoveFriend = (friendName: string) => {
    RemoveFriends(friendName, setFriends);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-2">
      {action === 'add' && (
        <div className="flex items-center justify-between px-5 py-3 border border-green-500 rounded-full text-sm text-black">
          <span>{`Add: ${input}`}</span>
          <button
            onClick={() => handleAddFriend(input)}
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
            key={friend}
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
}

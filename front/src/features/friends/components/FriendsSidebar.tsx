import FriendsList from './FriendsList';
import type { FriendAction } from './Friends';
import type { OpenState } from './Friends';
import FriendsSearchBar from './FriendsSearchBar';
import { useState } from 'react';
import FriendsRequests from './Functionalities/FriendRequests';

type FriendsSidebarProps = OpenState & {
  action: FriendAction;
  friends: string[];
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
  requests: string[];
  setRequests: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function FriendsSidebar({
  action,
  isOpen,
  setIsOpen,
  friends,
  setFriends,
  requests,
  setRequests,
}: FriendsSidebarProps) {
  const [input, setInput] = useState('');

  const filteredFriends = friends.filter((friend) => {
    return friend.toLowerCase().startsWith(input.toLowerCase());
  });

  let borderClass = '';
  switch (action) {
    case 'add':
      borderClass = 'border-green-500!';
      break;
    case 'remove':
      borderClass = 'border-red-500!';
      break;
    case 'request':
      borderClass = 'border-orange-500!';
      break;
    case 'default':
      borderClass = 'border-blue-500!';
      break;
  }

  return (
    isOpen && (
      <div
        className={`glassmorphism-popup relative max-w-80 flex flex-col h-[25vh]
					w-[25vw] rounded-xl overflow-hidden ${borderClass}`}
      >
        <button
          className="glassmorphism-element border-slate-700! absolute top-1 right-4 rounded-xl w-6 h-6 duration-150 cursor-pointer hover:bg-sky-900! hover:text-white! active:scale-70"
          onClick={() => setIsOpen(false)}
        >
          X
        </button>
        <div className="flex-1 overflow-y-auto pr-10">
          {action === 'request' ? (
            <FriendsRequests
              setFriends={setFriends}
              requests={requests}
              setRequests={setRequests}
            />
          ) : (
            <FriendsList
              friends={filteredFriends}
              action={action}
              setFriends={setFriends}
              input={input}
              setInput={setInput}
            />
          )}
        </div>
        <div className={`glassmorphism-popup ${borderClass}`}>
          <FriendsSearchBar action={action} input={input} setInput={setInput} />
        </div>
      </div>
    )
  );
}

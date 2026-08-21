import FriendsList from './FriendsList';
import type { FriendAction, OpenState } from './Friends';
import type { User, PendingRequest } from '../../api/friends';
import FriendsSearchBar from './FriendsSearchBar';
<<<<<<< HEAD:front/src/components/Friends/FriendsSidebar.tsx
import { useState, useEffect } from 'react';
import FriendsRequests from './Functionalities/FriendRequests';
=======
import { useState } from 'react';
import FriendsRequests from './FriendRequests';
>>>>>>> 16cd49e ([FE] Rearranged files organization and unified css):front/src/features/friends/components/FriendsSidebar.tsx

type FriendsSidebarProps = OpenState & {
  action: FriendAction;
  friends: User[];
  requests: PendingRequest[];
  errorMsg: string | null;
  onDataChanged: () => void;
};

export default function FriendsSidebar({
  action,
  setIsOpen,
  friends,
  requests,
  onDataChanged,
}: FriendsSidebarProps) {
  const [input, setInput] = useState('');

  // Réinitialise la recherche lors du changement de mode
  useEffect(() => {
    setInput('');
  }, [action]);

  // Filtrage local des amis existants (pour les modes 'default' et 'remove')
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(input.toLowerCase().trim())
  );

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

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
<<<<<<< HEAD:front/src/components/Friends/FriendsSidebar.tsx
    <div
      className={`glassmorphism-popup relative max-w-80 flex flex-col h-[25vh]
        w-[25vw] rounded-xl overflow-hidden ${borderClass}`}
    >
      <button
        type="button"
        className="glassmorphism-element border-slate-700! absolute top-1 right-4 rounded-xl w-6 h-6 duration-150 cursor-pointer hover:bg-sky-900! hover:text-white! active:scale-70"
        onClick={handleClose}
      >
        X
      </button>
      <div className="flex-1 overflow-y-auto pr-10">
        {action === 'request' ? (
          <FriendsRequests
            requests={requests}
            onDataChanged={onDataChanged}
          />
        ) : (
          <FriendsList
            friends={action === 'add' ? friends : filteredFriends}
            action={action}
            input={input}
            setInput={setInput}
            onDataChanged={onDataChanged}
          />
        )}
=======
    isOpen && (
      <div
        className={`glass-panel relative max-w-80 flex flex-col h-[25vh]
					w-[25vw] rounded-xl overflow-hidden ${borderClass}`}
      >
        <button
          className="glass-panel border-slate-700! absolute top-1 right-4 rounded-xl w-6 h-6 duration-150 cursor-pointer hover:text-white! active:scale-70"
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
        <div className={`glass-panel ${borderClass}`}>
          <FriendsSearchBar action={action} input={input} setInput={setInput} />
        </div>
>>>>>>> 16cd49e ([FE] Rearranged files organization and unified css):front/src/features/friends/components/FriendsSidebar.tsx
      </div>
      <div className={`glassmorphism-popup ${borderClass}`}>
        <FriendsSearchBar action={action} input={input} setInput={setInput} />
      </div>
    </div>
  );
}
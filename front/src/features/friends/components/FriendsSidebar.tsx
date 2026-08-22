import { useState, useEffect } from 'react';
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
};

export default function FriendsSidebar({
  action,
  setAction,
  isOpen,
  setIsOpen,
  friends,
  requests,
  onDataChanged,
}: FriendsSidebarProps) {
  const [input, setInput] = useState('');
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  useEffect(() => {
    setInput('');
  }, [action]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(input.toLowerCase().trim())
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
      {action !== 'menu' && (
        <button
          type="button"
          aria-label="Back"
          className="glass-element absolute top-2 left-2 z-10 w-8 h-8 p-1.5! rounded-xl duration-150 cursor-pointer hover:text-white! active:scale-70 flex items-center justify-center"
          onClick={handleBack}
        >
          <svg
            className="w-full h-full"
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
      <button
        type="button"
        aria-label="Close"
        className="glass-element absolute top-2 right-2 z-10 w-8 h-8 p-1.5! rounded-xl duration-150 cursor-pointer hover:text-white! active:scale-70 flex items-center justify-center"
        onClick={handleClose}
      >
        <svg
          className="w-full h-full"
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
      <div className="flex-1 overflow-y-auto pt-10 px-3">
        {action === 'menu' ? (
          <div className="flex flex-col gap-2 py-2">
            <button
              type="button"
              className="border-blue-600 border-2 py-1.5 text-sm rounded-xl hover:bg-blue-600 hover:text-white cursor-pointer duration-150 font-medium"
              onClick={() => setAction('default')}
            >
              Search Friends
            </button>
            <button
              type="button"
              className="border-orange-600 border-2 py-1.5 text-sm rounded-xl hover:bg-orange-600 hover:text-white cursor-pointer duration-150 font-medium"
              onClick={() => setAction('request')}
            >
              Pending Requests ({requests.length})
            </button>
            <button
              type="button"
              className="border-green-600 border-2 py-1.5 text-sm rounded-xl hover:bg-green-600 hover:text-white cursor-pointer duration-150 font-medium"
              onClick={() => setAction('add')}
            >
              Add a friend
            </button>
            <button
              type="button"
              className="border-red-600 border-2 py-1.5 text-sm rounded-xl hover:bg-red-600 hover:text-white cursor-pointer duration-150 font-medium"
              onClick={() => setAction('remove')}
            >
              Remove a friend
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
      {action !== 'menu' && (
        <div className="glass-panel">
          <FriendsSearchBar action={action} input={input} setInput={setInput} />
        </div>
      )}
    </div>
  );
}
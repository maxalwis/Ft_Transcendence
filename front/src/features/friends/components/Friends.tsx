import FriendsButton from './FriendsButton';
import FriendsSidebar from './FriendsSidebar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Context/AuthContext.tsx';

export type FriendAction = 'default' | 'add' | 'remove' | 'request';

export type ActionState = {
  action: FriendAction;
};

export type OpenState = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Friends() {
  const [action, setAction] = useState<FriendAction>('default');
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState(['Alice', 'Bob', 'Charlie', 'Max', 'Flav']);
  const [requests, setRequests] = useState(['Diana', 'Evan']);

  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen)
    return (
      <div className="fixed flex flex-col w-50 bottom-2 left-1 z-1000">
        <button
          className="glassmorphism-popup p-2 cursor-pointer hover:bg-sky-900! hover:text-white duration-500 active:scale-70"
          onClick={() => {
            if (!user) {
              navigate('/login');
              return;
            }
            setAction('default');
            setIsOpen(true);
          }}
        >
          Friends
        </button>
      </div>
    );

  return (
    <div className="fixed bottom-1 left-1 z-1000 flex items-end gap-1">
      <FriendsSidebar
        action={action}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        friends={friends}
        setFriends={setFriends}
        requests={requests}
        setRequests={setRequests}
      />
      <FriendsButton setAction={setAction} />
    </div>
  );
}

import FriendsButton from './FriendsButton';
import FriendsSidebar from './FriendsSidebar';
import { getFriends, getPendingRequests } from '../../api/friends';
import type { User, PendingRequest } from '../../api/friends';
import { useState, useEffect } from 'react';

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
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [friendsList, pendingList] = await Promise.all([getFriends(), getPendingRequests()]);
      setFriends(friendsList);
      setRequests(pendingList);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de chargement.');
    }
  };

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

	if (!isOpen)
	return (
		<div className="fixed flex flex-col w-50 bottom-2 left-1 z-1000">
		<button
			className="glassmorphism-popup p-2 cursor-pointer hover:bg-sky-900! hover:text-white duration-500 active:scale-70"
			onClick={() => {
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
        errorMsg={errorMsg}
        onDataChanged={loadData}
      />
      <FriendsButton setAction={setAction} />
    </div>
  );
}

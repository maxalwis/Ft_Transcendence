import FriendsButton from './FriendsButton';
import FriendsSidebar from './FriendsSidebar';
import { useState } from 'react';

export type FriendAction = 'default' | 'add' | 'remove' | 'request';

export type OpenState = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Friends() {
  const [action, setAction] = useState<FriendAction>('default');
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen)
	return (
		<div className="fixed flex flex-col bottom-1 left-1 z-1000">
			<button
				className="glassmorphism-popup p-2 duration-150 cursor-pointer hover:bg-sky-900! hover:text-white duration-500 active:scale-70"
				onClick={() => setIsOpen(true)}>
					Friends
			</button>
		</div>
    );

  return (
    <div className="fixed bottom-1 left-1 z-[1000] flex items-end gap-1">
      <FriendsSidebar action={action} isOpen={isOpen} setIsOpen={setIsOpen} />
      <FriendsButton setAction={setAction} />
    </div>
  );
}

import FriendsList from './FriendsList';
import UserSearch from './UserSearch';
import { useState } from 'react';
import type { FriendAction } from './Friends';

type FriendsSidebarProps = {
	action: FriendAction;
};

export default function Friends({ action }: FriendsSidebarProps)
{
	const [isOpen, setIsOpen] = useState(true);
	
	let borderClass = "";
	switch (action) {
		case "add":
			borderClass= "border-green-500!";
			break;
		case "remove":
			borderClass= "border-red-500!";
			break;
		case "request":
			borderClass= "border-orange-500!";
			break;
		case 'default':
			borderClass= "border-blue-500!";
			break;
	}

	if (!isOpen)
		return null;
	
	return (
	
	<div className={`glassmorphism-popup relative max-w-80 flex flex-col h-[20vh]
	w-[25vw] rounded-xl overflow-hidden ${borderClass}`}>
		<button
			className='glassmorphism-element absolute top-1 right-1 rounded-xl w-6 h-6 duration-150 cursor-pointer hover:bg-slate-400!'
			onClick={() => setIsOpen(false)}>
			X
		</button>
		<div className='flex-1 overflow-y-auto'>
			<FriendsList />
		</div>
		<div className={`glassmorphism-popup ${borderClass}`}>
			<UserSearch />
		</div>
	</div>
	);
}
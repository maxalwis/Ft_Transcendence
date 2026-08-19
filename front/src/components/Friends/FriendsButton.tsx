import '../Map/Map.css';
import React, { useState } from 'react';
import type { FriendAction } from './Friends';

type FriendsButtonProps = {
  setAction: React.Dispatch<React.SetStateAction<FriendAction>>;
};

export default function FriendsButton({ setAction }: FriendsButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
	<>
		<button
		className="flex h-8 w-8 items-center justify-center bg-white/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl text-lg
		font-bold text-gray-600 hover:bg-sky-900! hover:text-white cursor-pointer duration-150 active:scale-50"
		onClick={() => setIsOpen(!isOpen)}
		>
		{isOpen ? '-' : '+'}
		</button>
		{isOpen && (
		<div className="flex flex-col glassmorphism-popup p-2 gap-2 text-sm">
			<button
			className="border-blue-600 border-2 rounded-xl hover:bg-blue-600 hover:text-white cursor-pointer duration-150"
			onClick={() => setAction('default')}
			>
			Search
			</button>
			<button
			className="border-orange-600 px-3 border-2 rounded-xl hover:bg-orange-600 hover:text-white cursor-pointer duration-150"
			onClick={() => setAction('request')}
			>
			Pending Request
			</button>
			<button
			className="border-green-600 border-2 rounded-xl hover:bg-green-600 hover:text-white cursor-pointer duration-150"
			onClick={() => setAction('add')}
			>
			Add a friend
			</button>
			<button
			className="border-red-600 border-2 rounded-xl hover:bg-red-600 hover:text-white cursor-pointer duration-150"
			onClick={() => setAction('remove')}
			>
			Remove a friend
			</button>
		</div>
		)}
	</>
	);
}

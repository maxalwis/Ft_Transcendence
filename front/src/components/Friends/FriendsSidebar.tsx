import FriendsList from './FriendsList';
import UserSearch from './UserSearch';
import type { FriendAction } from './Friends';
import type { OpenState  } from './Friends';

type FriendsSidebarProps = OpenState & {
	action: FriendAction;
};

export default function Friends({ action, isOpen, setIsOpen }: FriendsSidebarProps)
{
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

	return (
		isOpen && (
		<div
			className={`glassmorphism-popup relative max-w-80 flex flex-col h-[20vh]
					w-[25vw] rounded-xl overflow-hidden ${borderClass}`}>
			<button
				className='glassmorphism-element absolute top-1 right-4 rounded-xl w-6 h-6 duration-150 cursor-pointer hover:bg-slate-400! active:scale-70'
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
	)
	);
}

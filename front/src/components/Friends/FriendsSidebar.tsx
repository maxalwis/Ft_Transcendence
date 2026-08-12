import FriendsList from './FriendsList';
import UserSearch from './UserSearch';

export default function Friends()
{
	return (
	<div className="glassmorphism-popup relative max-w-80 flex flex-col h-[20vh] w-[25vw] rounded-xl overflow-hidden">
		<div className='flex-1 overflow-y-auto'>
			<FriendsList />
		</div>
		<div className="glassmorphism-popup">
			<UserSearch />
		</div>
	</div>
	);
}
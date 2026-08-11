import '../Sidebar/Chat/Chat.css';
import FriendsList from './FriendsList';
// import FriendsRequests from './FriendsRequests';
import UserSearch from './UserSearch';

export default function Friends()
{
	return (
	<div className="glassmorphism-popup absolute max-w-80 flex flex-col bottom-1.5 h-[20vh] w-[25vw] rounded-xl left-1 overflow-hidden z-1000">
		<div className='flex-1 overflow-y-auto min-h-0'>
			<FriendsList />
		<div className="glassmorphism-popup">
        	<UserSearch />
		</div>
       </div>
		{/* <div> */}
			{/* <FriendsRequests /> */}
		{/* </div> */}
	</div>
	);
}
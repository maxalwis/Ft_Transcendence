import FriendsAdd from "./FriendsAdd";
import FriendsSidebar from "./FriendsSidebar";

export default function Friends()
{
	return (
		<div className="fixed bottom-1 left-1 z-1000 flex items-end gap-1">
			<FriendsSidebar />
			<FriendsAdd />
		</div>
	);
}
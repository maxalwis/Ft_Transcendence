import FriendsButton from "./FriendsButton";
import FriendsSidebar from "./FriendsSidebar";
import { useState } from "react";

export type FriendAction = "default" | "add" | "remove" | "request";

export default function Friends()
{
	const [action, setAction] = useState<FriendAction>("default");

	return (
		<div className="fixed bottom-1 left-1 z-1000 flex items-end gap-1">
			<FriendsSidebar action={action}/>
			<FriendsButton setAction={setAction}/>
		</div>
	);
}
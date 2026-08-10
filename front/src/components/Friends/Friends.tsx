export default function Friends()
{
	return (
		<div className="flex flex-col h-full p-4">
			<h2 className="text-xl font-bold mb-4"> </h2>

			<UserSearch />
			<FriendRequests />
			<FriendList />
		</div>
	);
}
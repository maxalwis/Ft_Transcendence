export default function FriendsList() {
	const friends = ['Alice', 'Bob', 'Charlie', 'Max', 'Flav'];

	return (
		<div className="flex flex-col gap-2">
			{friends.map((friend) => (
				<div
					key={friend}
					className="flex items-center gap-3 rounded-lg bg-white/10 px-2 py-1 text-sm text-black">
					<div className="relative shrink-0">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-white">
							{friend.charAt(0)}
						</div>
						<div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
					</div>
					<span>{friend}</span>
				</div>
			))}
		</div>
	);
}
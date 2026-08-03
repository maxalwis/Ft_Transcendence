import Chat from "./Chat/Chat";

export default function MySidebar() {
	return (
	<div className="fixed top-2 right-3 w-[20vw] h-[96.5vh] bg-teal-50 rounded-xl p-5 shadow-lg z-1000 flex flex-col">
		<div className = "flex-3" >
			Event
		</div>
		<div className = "flex-7" >
			Chat
		</div>
		{/* <div className = "flex"> */}
		<div>
			<Chat></Chat>
		</div>
	</div>
	);
}

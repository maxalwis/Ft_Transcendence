import Chat from "./Chat/Chat";

export default function MySidebar() {
	return (
	<div className="fixed top-2 right-3 w-[20vw] h-[96.5vh] bg-teal-50 rounded-xl p-5 shadow-lg z-1000 flex flex-col">
		<div className="h-[30%] overflow-hidden">
			Event
		</div>
		<div className="h-[70%] flex flex-col overflow-hidden">
			<Chat></Chat>
		</div>
	</div>
	);
}

import Chat from "./Chat/Chat";

interface ChatWindowProps {
	onClose: () => void;
}

export default function MySidebar({ onClose } : ChatWindowProps)
{
	return (
		<div className="fixed top-2 right-3 w-[20vw] h-[96.5vh] bg-teal-50 rounded-xl p-5 shadow-lg z-1000 flex flex-col">
			<div>
				<button
					className="hover:bg-red-400 w-6 h-6 rounded-full font-bold font-stretch-150% 
					cursor-pointer shadow-md shadow-red-400 absolute right-3 flex items-center justify-center"
					onClick={onClose}>
					 x
				</button>
			</div>
			<div className="h-[30%] overflow-hidden">
				Event
			</div>
			<div className="h-[70%] flex flex-col overflow-hidden">
				<Chat></Chat>
			</div>
		</div>
	);
}

import { useState } from "react";

type Message = {
		id: number;
		user: string;
		text: string;
};

export default function MessageInput()
{
	const [messages, setMessages] = useState<Message[]>([]);

	const	handleSend = () => {
		
		console.log("bouton cliqué");

		setMessages([
		...messages,
			{
				id: 1,
				text: "Bonjour",
				user: "Moi"
			}
		]);
	};

	return (
		<div className="flex w-full gap-1">
			<textarea
					className="bg-teal-100 p-1 border border-r-gray-800 text-sm w-full outline-none resize-none line rounded-2xl"
					placeholder="Type a message">
			</textarea>
			<button className="bg-teal-200 text-sm rounded-4xl size-8 border border-r-gray-800 self-center"
					onClick={handleSend}>
						⬆️
			</button>
		</div>
	);
}
import { useState } from "react";

type Message = {
	id: number;
	user: string;
	text: string;
};

type MessageInputProps = {
	messages: Message[];
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export default function MessageInput({messages,setMessages}: MessageInputProps)
{
	const [input, setInput] = useState("");

	const handleSend = () => {
		if (input.trim() === "")
			return;

		setMessages([
			...messages,
			{
				id: messages.length + 1,
				text: input,
				user: "Moi",
			},
		]);
		setInput("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex w-full gap-1">
			<textarea
				className="bg-teal-100 p-1 border border-r-gray-800 text-sm w-full outline-none resize-none rounded-2xl"
				placeholder="Type a message"
				maxLength={150}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}>
			</textarea>
			<button
				type="button"
				className="bg-teal-200 cursor-pointer text-sm rounded-4xl size-8 border border-r-gray-800 self-center"
				onClick={handleSend}>
					⬆️
			</button>
		</div>
	);
}

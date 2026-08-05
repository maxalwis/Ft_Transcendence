import { useState } from "react";
import MessageInput from "./MessageInput";
import MessageOutput from "./MessageOutput";

type Message = {
		id: number;
		user: string;
		text: string;
};

export default function Chat()
{
	const [messages, setMessages] = useState<Message[]>([]);

	return (
	<div className="flex flex-col h-full gap-3">
		<div className="flex-1 overflow-auto">
			<MessageOutput messages={messages} />
		</div>
		<div className="flex-none">
			<MessageInput messages={messages}
				setMessages={setMessages} />
		</div>
	</div>
	);
}

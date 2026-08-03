import { useState } from "react";
import MessageInput from "./MessageInput";
import MessageOutput from "./MessageOutput";

type Message = {
		id: number;
		user: string;
		text: string;
};

function Chat()
{
	const [messages, setMessages] = useState<Message[]>([]);
	
	return (
	<div className="flex-col">
		<div className="flex-initial">
			<MessageInput
				messages={messages}
				setMessages={setMessages}
			></MessageInput>
		</div>
		<div className="flex-1">
			<MessageOutput
				messages={messages}
			></MessageOutput>
		</div>
	</div>	
	);

}

export default Chat;
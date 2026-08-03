type Message = {
	id: number;
	user: string;
	text: string;
};

type MessageOutputProps = {
	messages: Message[];
};

export default function MessageOutput({ messages }: MessageOutputProps)
{
	return (
		<div>
			{messages.map((message) => (
				<p key={message.id}>
					{message.user}: {message.text}
				</p>
			))}
		</div>
	);
}
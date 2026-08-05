import { useEffect, useRef } from "react";

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
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex flex-col gap-1 min-h-full justify-end">
			{messages.map((message) => (
				<p key={message.id} className="bg-white rounded-xl p-1 wrap-break-word text-sm">
					{message.user}: {message.text}
				</p>
			))}
			<div ref={bottomRef} />
		</div>
	);
}

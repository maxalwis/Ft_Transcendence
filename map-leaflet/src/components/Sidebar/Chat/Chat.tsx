import "./MessageInput"

function Chat()
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

export default Chat;
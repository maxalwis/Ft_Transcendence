import './Chat.css';
// import { useState } from 'react';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';

type Message = {
  id: number;
  user: string;
  text: string;
};

type MessageProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export default function Chat( { messages }: MessageProps) {
//   const [messages, setMessages] = useState<Message[]>([]);

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 overflow-auto">
        <MessageOutput messages={messages} />
      </div>
      <div className="flex-none">
        <MessageInput messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
}

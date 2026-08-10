import './Chat.css';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';
import type { MessageProps } from './MessageInput';

export default function Chat({ messages, setMessages }: MessageProps) {
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

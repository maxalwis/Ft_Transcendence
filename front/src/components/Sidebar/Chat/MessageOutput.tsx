import { useEffect, useRef } from 'react';

type Message = {
  id: number;
  user: string;
  text: string;
};

type MessageOutputProps = {
  messages: Message[];
};

export default function MessageOutput({ messages }: MessageOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-2 min-h-full justify-end overflow-y-auto p-2">
      {messages.map((message) => {
        const isMe = message.user === 'Me';

        return (
          <div
            key={message.id}
            className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <span className="text-[10px] text-gray-400 px-1 mb-0.5">{message.user}</span>
            <div
              className={`rounded-2xl px-3.5 py-2 text-sm break-words shadow-sm ${
                isMe
                  ? 'glass-blue text-white rounded-br-xs'
                  : 'glassmorphism-element text-gray-200 border border-gray-700/50 rounded-bl-xs'
              }`}
            >
              {message.text}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

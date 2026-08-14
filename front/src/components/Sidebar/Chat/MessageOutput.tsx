import { useEffect, useRef } from 'react';
import type { Message } from './Chat';

type MessageOutputProps = {
  messages: Message[];
  currentUserId?: number; // Pass current user ID to check if "isMe"
};

export default function MessageOutput({ messages, currentUserId = 1 }: MessageOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-2 min-h-full justify-end overflow-y-auto p-2">
      {messages.map((message) => {
        // Check if the message was sent by the current logged-in user
        const isMe = message.userId === currentUserId;
        const displayName = message.user?.name || message.user?.email || 'Unknown User';

        return (
          <div
            key={message.id}
            className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <span className="text-[10px] text-gray-400 px-1 mb-0.5">{displayName}</span>
            <div
              className={`rounded-2xl px-3.5 py-2 text-sm break-all shadow-sm ${
                isMe
                  ? 'glass-blue text-white rounded-br-xs'
                  : 'glassmorphism-element text-gray-200 border border-gray-700/50 rounded-bl-xs'
              }`}
            >
              {message.content}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

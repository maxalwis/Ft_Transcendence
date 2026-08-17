import { useEffect, useState } from 'react';
import './Chat.css';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';
import { fetchEventMessages, sendEventMessage } from './chatService';

export type Message = {
  id: number;
  content: string;
  user: { name?: string; email: string };
  createdAt: string;
};

interface ChatProps {
  eventId: string;
  currentUserId: number; // Logged-in user ID
}

export default function Chat({ eventId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch messages on mount or when event changes
  useEffect(() => {
    let isMounted = true;
    fetchEventMessages(eventId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // 2. Handle sending through the backend
  const handleSendMessage = async (text: string) => {
    try {
      const newMessage = await sendEventMessage(eventId, text, currentUserId);
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) return <div className="text-gray-400 text-sm p-4">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 overflow-auto">
        <MessageOutput messages={messages} currentUserId={currentUserId} />
      </div>
      <div className="flex-none">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import '../Chat.module.css';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';
import { fetchEventMessages, sendEventMessage } from '../chatService';
import { useNotification } from '../../../context/notifications/NotificationContext';
import { useAuth } from '../../../context/auth/AuthContext';

export type Message = {
  id: number;
  content: string;
  userId: number;
  user: { username?: string; email: string };
  createdAt: string;
};

interface ChatProps {
  eventId: string;
  currentUserId: number; // Logged-in user ID
}

export default function Chat({ eventId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const { accessToken } = useAuth();

  // Fetch messages on mount or when event changes
  useEffect(() => {
    if (!accessToken) return;
    let isMounted = true;
    fetchEventMessages(eventId, accessToken)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err) => {
        // CORRECTION 1: Utilisation de showError au lieu de setErrorMessage
        if (isMounted) showError(err.message || 'Failed to load messages');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, accessToken, showError]);

  // Handle sending through the backend
  const handleSendMessage = async (text: string) => {
    if (!accessToken) {
      showError('You must be logged in to send a message.');
      return;
    }
    try {
      const newMessage = await sendEventMessage(eventId, text, accessToken);
      setMessages((prev) => [...prev, newMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      showError(`Error while trying to send the message: ${err.message}`);
    }
  };

  if (loading)
    return (
      <div className="text-gray-400 flex items-center justify-center text-sm p-4">
        Loading messages...
      </div>
    );

  return (
    <div className="flex flex-col h-full gap-3 relative">
      <div className="flex-1 overflow-auto">
        <MessageOutput messages={messages} currentUserId={currentUserId} />
      </div>
      <div className="flex-none">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}

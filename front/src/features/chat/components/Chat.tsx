import { useEffect, useState, useCallback } from 'react';
import styles from './chat.module.css';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';
import { fetchEventMessages, sendEventMessage } from '../chatService';
import { useNotification } from '../../../context/notifications/NotificationContext';
import { useAuth } from '../../../context/auth/AuthContext';
import { useChatSocket } from '../hooks/useChatSocket';

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

  // Ajoute le message reçu en temps réel, en évitant les doublons
  // (utile si le message optimiste de handleSendMessage arrive avant l'echo du socket)
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  useChatSocket(eventId, handleNewMessage);

  // Handle sending through the backend
  const handleSendMessage = async (text: string) => {
    if (!accessToken) {
      showError('You must be logged in to send a message.');
      return;
    }
    try {
      const newMessage = await sendEventMessage(eventId, text, accessToken);
      setMessages((prev) =>
        prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]
      );
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

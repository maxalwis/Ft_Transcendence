import { useEffect, useState } from 'react';
import '../Chat.module.css';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';
import { fetchEventMessages, sendEventMessage } from '../chatService';
import { useNotification } from '../../../context/notifications/NotificationContext';
import { useTranslation } from 'react-i18next';

export type Message = {
  id: number;
  content: string;
  user: { username?: string; email: string };
  createdAt: string;
};

interface ChatProps {
  eventId: string;
  currentUserId: number; // Logged-in user ID
}

export default function Chat({ eventId, currentUserId }: ChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  // Fetch messages on mount or when event changes
  useEffect(() => {
    let isMounted = true;
    fetchEventMessages(eventId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err) => {
        if (isMounted) showError(err.message || t('chat.errorLoadMessages', 'Failed to load messages'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, showError, t]);

  // Handle sending through the backend
  const handleSendMessage = async (text: string) => {
    try {
      const newMessage = await sendEventMessage(eventId, text, currentUserId);
      setMessages((prev) => [...prev, newMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      showError(`${t('chat.errorSend', 'Error while trying to send the message')}: ${err.message}`);
    }
  };

  if (loading) return <div className="text-gray-400 flex items-center justify-center text-sm p-4">{t('chat.loadingMessages', 'Loading messages...')}</div>;

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
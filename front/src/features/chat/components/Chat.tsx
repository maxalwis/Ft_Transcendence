import { useEffect, useState, useCallback, useRef } from 'react';
import MessageInput from './MessageInput';
import MessageOutput from './MessageOutput';
import { fetchEventMessages, sendEventMessage } from '../../../api/messages';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';
import { useTranslation } from 'react-i18next';
import { useChatSocket } from '../hooks/useChatSocket';
import EmptyState from '../../../components/ui/EmptyState';
import Spinner from '../../../components/ui/Spinner';

export type Message = {
  id: number;
  content: string;
  userId: number;
  user: { username?: string; avatar?: string };
  createdAt: string;
  pending?: boolean; // optimistic message not yet confirmed by the server
};

interface ChatProps {
  eventId: string;
  currentUserId: number; // Logged-in user ID
}

export default function Chat({ eventId, currentUserId }: ChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { showWarning } = useNotification();
  const { accessToken, user } = useAuth();
  const tempIdRef = useRef(0);

  // Fetch messages on mount or when event changes
  useEffect(() => {
    if (!accessToken) return;
    let isMounted = true;
    fetchEventMessages(eventId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err: unknown) => {
        console.error('Error loading messages:', err);
        if (isMounted) showWarning(t('chat.errors.loadMessages', 'Failed to load messages'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, accessToken, showWarning, t]);

  // Ajoute le message reçu en temps réel, en évitant les doublons
  // (utile si le message optimiste de handleSendMessage arrive avant l'echo du socket)
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  useChatSocket(handleNewMessage);

  // Handle sending through the backend
  const handleSendMessage = async (text: string) => {
    if (!accessToken) {
      showWarning(t('chat.errors.loginRequiredToSend', 'You must be logged in to send a message.'));
      return;
    }
    // Affiche le message tout de suite (ids négatifs = temporaires), confirmé à la réponse du serveur
    const tempId = --tempIdRef.current;
    const optimistic: Message = {
      id: tempId,
      content: text,
      userId: currentUserId,
      user: { username: user?.username, avatar: user?.avatar ?? undefined },
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const newMessage: Message = await sendEventMessage(eventId, text);
      // L'echo du socket a pu arriver avant la réponse HTTP : on évite le doublon
      setMessages((prev) => {
        const rest = prev.filter((m) => m.id !== tempId);
        return rest.some((m) => m.id === newMessage.id) ? rest : [...rest, newMessage];
      });
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error('Error sending message:', err);
      if (err instanceof Error && err.message === 'TOO_MANY_ATTEMPTS') {
        showWarning(t('chat.errors.tooManyMessages'));
        return;
      }
      showWarning(t('chat.errors.sendMessage', 'Error while trying to send the message'));
    }
  };

  if (loading)
    return (
      <EmptyState>
        <Spinner size="sm" label={t('chat.loadingMessages', 'Loading messages...')} />
      </EmptyState>
    );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 relative">
      <div className="flex-1 min-h-0 overflow-auto">
        <MessageOutput messages={messages} currentUserId={currentUserId} />
      </div>
      <div className="flex-none">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}

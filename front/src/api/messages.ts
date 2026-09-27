import { request } from './api';

export interface Message {
  id: number;
  content: string;
  userId: number;
  eventId: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export async function fetchEventMessages(eventId: string): Promise<Message[]> {
  const res = await request(`/events/${eventId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendEventMessage(eventId: string, content: string): Promise<Message> {
  const res = await request(`/events/${eventId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(', ')
      : errorData?.message || 'Failed to send message';
    throw new Error(message);
  }

  return res.json();
}

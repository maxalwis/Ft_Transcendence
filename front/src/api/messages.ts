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
  if (!res.ok) throw new Error('MESSAGES_LOAD_FAILED');
  return res.json();
}

export async function sendEventMessage(eventId: string, content: string): Promise<Message> {
  const res = await request(`/events/${eventId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error(res.status === 429 ? 'TOO_MANY_ATTEMPTS' : 'MESSAGE_SEND_FAILED');
  }

  return res.json();
}

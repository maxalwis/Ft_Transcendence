const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export async function fetchEventMessages(eventId: string, accessToken: string): Promise<Message[]> {
  const res = await fetch(`${baseUrl}/events/${eventId}/messages`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendEventMessage(
  eventId: string,
  content: string,
  accessToken: string
): Promise<Message> {
  const res = await fetch(`${baseUrl}/events/${eventId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify({ content }), // plus de userId, le back le déduit du token
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

const API_URL = 'http://localhost:3000';

export async function fetchEventMessages(eventId: string) {
  const res = await fetch(`${API_URL}/events/${eventId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendEventMessage(eventId: string, content: string, userId: number) {
  const res = await fetch(`${API_URL}/events/${eventId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, userId }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
// Passer par le proxy Reverse Nginx en chemin relatif
const API_URL = '/api';

export async function fetchEventMessages(eventId: string, accessToken: string) {
  const res = await fetch(`${API_URL}/events/${eventId}/messages`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendEventMessage(eventId: string, content: string, accessToken: string) {
  const res = await fetch(`${API_URL}/events/${eventId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    // Extracts NestJS "message" string or array, or falls back to status text
    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(', ')
      : errorData?.message || 'Failed to send message';

    throw new Error(message);
  }

  return res.json();
}

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface EventInterest {
  userId: number;
  eventId: string;
}

export interface InterestStatus {
  isInterested: boolean;
  count: number;
}

export interface InterestedFriend {
  userId: number;
  eventId: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export async function markInterested(eventId: string, accessToken: string): Promise<EventInterest> {
  const res = await fetch(`${baseUrl}/events/${eventId}/interest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Impossible d'ajouter l'intérêt");
  return res.json();
}

export async function removeInterest(eventId: string, accessToken: string): Promise<void> {
  const res = await fetch(`${baseUrl}/events/${eventId}/interest`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Impossible de retirer l'intérêt");
}

export async function getInterestCount(eventId: string): Promise<number> {
  const res = await fetch(`${baseUrl}/events/${eventId}/interest/count`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération du compteur');
  return res.json();
}

export async function getFriendsInterested(
  eventId: string,
  accessToken: string
): Promise<InterestedFriend[]> {
  const res = await fetch(`${baseUrl}/events/${eventId}/interest/friends`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des amis intéressés');
  return res.json();
}

export async function isInterested(eventId: string, accessToken: string): Promise<boolean> {
  const res = await fetch(`${baseUrl}/events/${eventId}/interest/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la vérification');
  return res.json();
}

export async function getInterestStatus(
  eventId: string,
  accessToken: string
): Promise<InterestStatus> {
  const res = await fetch(`${baseUrl}/events/${eventId}/interest/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération du statut');
  return res.json();
}

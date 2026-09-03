const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${baseUrl}/friends`;

export interface User {
  id: number;
  username: string;
  avatar?: string;
  preferredCategory?: string | null;
  preferredLanguage?: string | null;
  status: 'ONLINE' | 'OFFLINE';
}

export interface PendingRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  sender: User;
  createdAt?: string;
}

export async function getFriends(accessToken: string): Promise<User[]> {
  const res = await fetch(API_URL, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Erreur de récupération des amis');
  return res.json();
}

export async function getPendingRequests(accessToken: string): Promise<PendingRequest[]> {
  const res = await fetch(`${API_URL}/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des demandes');
  return res.json();
}

export async function sendFriendRequest(receiverId: number, accessToken: string) {
  const res = await fetch(`${API_URL}/request/${receiverId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Erreur lors de l'envoi");
  }
  return res.json();
}

export async function acceptFriendRequest(senderId: number, accessToken: string) {
  const res = await fetch(`${API_URL}/accept/${senderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Impossible d'accepter la demande");
  return res.json();
}

export async function removeFriend(friendId: number, accessToken: string) {
  const res = await fetch(`${API_URL}/${friendId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Impossible de supprimer cet ami');
  return res.json();
}

import { request } from './api';

const API_URL = '/friends';

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

export async function getFriends(): Promise<User[]> {
  const res = await request(API_URL);

  if (!res.ok) {
    throw new Error('Erreur de récupération des amis');
  }

  return res.json();
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const res = await request(`${API_URL}/pending`);

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des demandes');
  }

  return res.json();
}

export async function sendFriendRequest(receiverId: number) {
  const res = await request(`${API_URL}/request/${receiverId}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Erreur lors de l'envoi");
  }

  return res.json();
}

export async function acceptFriendRequest(senderId: number) {
  const res = await request(`${API_URL}/accept/${senderId}`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error("Impossible d'accepter la demande");
  }

  return res.json();
}

export async function rejectFriendRequest(senderId: number) {
  const res = await request(`${API_URL}/reject/${senderId}`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(', ')
      : errorData?.message;

    throw new Error(message || `Impossible de refuser la demande (${res.status})`);
  }

  return res.json();
}

export async function removeFriend(friendId: number) {
  const res = await request(`${API_URL}/${friendId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Impossible de supprimer cet ami');
  }

  return res.json();
}

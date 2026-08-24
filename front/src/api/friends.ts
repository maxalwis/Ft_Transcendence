const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${baseUrl}/friends`;

export interface User {
  id: number;
  name: string;
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
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
  const res = await fetch(API_URL, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur de récupération des amis');
  return res.json();
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const res = await fetch(`${API_URL}/pending`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des demandes');
  return res.json();
}

export async function sendFriendRequest(receiverId: number) {
  const res = await fetch(`${API_URL}/request/${receiverId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Erreur lors de l'envoi");
  }
  return res.json();
}

export async function acceptFriendRequest(senderId: number) {
  const res = await fetch(`${API_URL}/accept/${senderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Impossible d'accepter la demande");
  return res.json();
}
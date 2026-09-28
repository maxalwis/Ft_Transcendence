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
    throw new Error('FRIENDS_LOAD_FAILED');
  }

  return res.json();
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const res = await request(`${API_URL}/pending`);

  if (!res.ok) {
    throw new Error('FRIEND_REQUESTS_LOAD_FAILED');
  }

  return res.json();
}

export async function sendFriendRequest(receiverId: number) {
  const res = await request(`${API_URL}/request/${receiverId}`, {
    method: 'POST',
  });

  if (!res.ok) {
    // Codes translated by the UI (useApiErrorMessage), never the backend's raw text
    const codes: Record<number, string> = {
      400: 'FRIEND_REQUEST_SELF',
      404: 'USER_NOT_FOUND',
      409: 'FRIEND_REQUEST_EXISTS',
      429: 'TOO_MANY_ATTEMPTS',
    };
    throw new Error(codes[res.status] ?? 'FRIEND_REQUEST_FAILED');
  }

  return res.json();
}

export async function acceptFriendRequest(senderId: number) {
  const res = await request(`${API_URL}/accept/${senderId}`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error('FRIEND_ACCEPT_FAILED');
  }

  return res.json();
}

export async function rejectFriendRequest(senderId: number) {
  const res = await request(`${API_URL}/reject/${senderId}`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error('FRIEND_REJECT_FAILED');
  }

  return res.json();
}

export async function removeFriend(friendId: number) {
  const res = await request(`${API_URL}/${friendId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('FRIEND_REMOVE_FAILED');
  }

  return res.json();
}

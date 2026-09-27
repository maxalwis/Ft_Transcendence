import { request } from './api';

const API_URL = '/users';

export interface UserSearchResult {
  id: number;
  username: string;
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE';
}

export interface UpdateProfilePayload {
  username: string;
  preferredLanguage?: string;
  preferredCategory?: string;
  avatar?: File;
}

export async function searchUsers(username: string): Promise<UserSearchResult[]> {
  if (!username.trim()) return [];

  const res = await request(`${API_URL}/search?username=${encodeURIComponent(username)}`);

  if (!res.ok) throw new Error('Erreur lors de la recherche');
  return res.json();
}

export type ChangePasswordErrorCode = 'INCORRECT_PASSWORD' | 'NO_PASSWORD_SET' | 'UNKNOWN';

export class ChangePasswordError extends Error {
  constructor(
    message: string,
    public code: ChangePasswordErrorCode
  ) {
    super(message);
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await request(`${API_URL}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    const message = error?.message ?? 'Password change failed';

    if (res.status === 401) throw new ChangePasswordError(message, 'INCORRECT_PASSWORD');
    if (res.status === 403) throw new ChangePasswordError(message, 'NO_PASSWORD_SET');
    throw new ChangePasswordError(message, 'UNKNOWN');
  }
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const formData = new FormData();

  formData.append('username', payload.username);

  if (payload.preferredLanguage) {
    formData.append('preferredLanguage', payload.preferredLanguage);
  }

  if (payload.preferredCategory) {
    formData.append('preferredCategory', payload.preferredCategory);
  }

  if (payload.avatar) {
    formData.append('avatar', payload.avatar);
  }

  const res = await request('/users/me', {
    method: 'PUT',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Échec de la mise à jour');
  }

  return res.json();
}

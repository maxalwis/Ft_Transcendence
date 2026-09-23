const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${baseUrl}/users`;

export interface UserSearchResult {
  id: number;
  username: string;
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE';
}

export async function searchUsers(
  username: string,
  accessToken: string
): Promise<UserSearchResult[]> {
  if (!username.trim()) return [];

  const res = await fetch(`${API_URL}/search?username=${encodeURIComponent(username)}`, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Erreur lors de la recherche');
  return res.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_URL}/password`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? 'Password change failed');
  }
}

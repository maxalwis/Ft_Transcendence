const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${baseUrl}/users`;

export interface UserSearchResult {
  id: number;
  username: string;
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
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

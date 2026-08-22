const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${baseUrl}/users`;

export interface UserSearchResult {
  id: number;
  name: string;
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
}

export async function searchUsers(name: string): Promise<UserSearchResult[]> {
  if (!name.trim()) return [];

  const res = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur lors de la recherche');
  return res.json();
}

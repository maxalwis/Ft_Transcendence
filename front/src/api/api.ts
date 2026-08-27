const API_URL = '/api';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // envoie le cookie refresh_token
    headers: {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(path, options, false);
    }
  }

  return res;
}

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    setAccessToken(null);
    return false;
  }
  const data = await res.json();
  setAccessToken(data.accessToken);
  return true;
}

// Version publique, utilisée après un login OAuth : renvoie aussi le user,
// contrairement à refreshAccessToken (interne, juste utilisée pour le retry sur 401).
export async function refresh() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data; // { accessToken, user }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: username, password }),
  });
  if (!res.ok) throw new Error('Identifiants invalides');
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export { request };

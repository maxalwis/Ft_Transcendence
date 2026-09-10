// GDPR API calls. Follows the project convention: VITE_API_URL base, Bearer token.
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${baseUrl}/gdpr`;

// GET the authenticated user's full data export (JSON).
export async function exportMyData(accessToken: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/export`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to export data');
  return res.json();
}

// Step 1: ask the backend to email a confirmation link.
export async function requestAccountDeletion(accessToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/delete-request`, {
    method: 'POST',
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to request account deletion');
}

// Step 2: confirm with the token from the email link (no session needed).
export async function confirmAccountDeletion(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/delete-confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Failed to confirm account deletion');
}

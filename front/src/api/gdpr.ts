import { request } from './api';

export async function exportMyData(): Promise<unknown> {
  const res = await request('/gdpr/export');
  if (!res.ok) throw new Error('Failed to export data');
  return res.json();
}

export async function requestAccountDeletion(): Promise<void> {
  const res = await request('/gdpr/delete-request', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to request account deletion');
}

// Confirms with the token from the email link (no session needed).
export async function confirmAccountDeletion(token: string): Promise<void> {
  const res = await request('/gdpr/delete-confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Failed to confirm account deletion');
}

import { request } from './api';

export async function exportMyData(): Promise<unknown> {
  const res = await request('/gdpr/export');
  if (!res.ok) throw new Error('GDPR_EXPORT_FAILED');
  return res.json();
}

export async function requestAccountDeletion(): Promise<void> {
  const res = await request('/gdpr/delete-request', { method: 'POST' });
  if (!res.ok) throw new Error('GDPR_DELETE_REQUEST_FAILED');
}

// Confirms from the logged-in account, with the emailed token and (for
// password accounts) the current password. Throws the backend's error code
// (TOKEN_EXPIRED / WRONG_PASSWORD / ...) so the caller can distinguish cases.
export async function confirmAccountDeletion(
  token: string,
  password: string | undefined
): Promise<void> {
  const res = await request('/gdpr/delete-confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    // Prefer the backend's machine-readable code (TOKEN_EXPIRED / WRONG_PASSWORD / ...);
    // fall back to the HTTP status if there's no JSON body.
    let code = String(res.status);
    try {
      const body = await res.json();
      if (body?.code) code = body.code;
    } catch {
      /* no JSON body */
    }
    throw new Error(code);
  }
}

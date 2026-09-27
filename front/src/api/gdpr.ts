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

// Step 2: confirm from the logged-in account, with the emailed token and
// (for password accounts) the current password. Throws the HTTP status so the
// caller can tell a wrong password (401) from other failures.
export async function confirmAccountDeletion(
  token: string,
  password: string | undefined,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_URL}/delete-confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
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

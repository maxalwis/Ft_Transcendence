import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { confirmAccountDeletion } from '../../api/gdpr';
import { useAuth } from '../../context/auth/useAuth';
import styles from './DeleteConfirm.module.css';
import Button from '../../components/ui/Button';

// Decode the JWT payload (sub + exp) for DISPLAY LOGIC ONLY. This is not a
// security check — deletion is authorized server-side by session + token +
// password.
function decodeToken(token: string): { sub?: string | number; exp?: number } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Page the deletion email link points to: /account/delete-confirm?token=...
export function DeleteConfirmPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuth();
  const isOAuth = !!user?.provider;
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorKey, setErrorKey] = useState('deleteConfirm.error');
  const [expired, setExpired] = useState(false);

  if (!token) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{t('deleteConfirm.invalidLink')}</p>
        <Link to="/" className={styles.cancelLink}>
          {t('deleteConfirm.cancel')}
        </Link>
      </div>
    );
  }

  // Checked before the other guards so a completed deletion (which clears the
  // session) shows the success screen instead of flashing another page.
  if (status === 'done') {
    return (
      <div className={styles.page}>
        <p>{t('deleteConfirm.done')}</p>
      </div>
    );
  }

  const payload = decodeToken(token);
  const isExpired = expired || (!!payload?.exp && payload.exp * 1000 < Date.now());

  // Expired link can never succeed : say so immediately, before asking for anything.
  if (isExpired) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{t('deleteConfirm.title')}</h1>
        <p className={styles.error}>{t('deleteConfirm.expired')}</p>
        <Link to="/" className={styles.cancelLink}>
          {t('deleteConfirm.cancel')}
        </Link>
      </div>
    );
  }

  // Must be logged in AND the link must target the currently logged-in account.
  const isForThisUser =
    !!accessToken && !!user && payload?.sub != null && String(payload.sub) === String(user.id);

  if (!isForThisUser) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{t('deleteConfirm.title')}</h1>
        <p className={styles.warning}>{t('deleteConfirm.mustLogin')}</p>
        <Link to="/" className={styles.cancelLink}>
          {t('deleteConfirm.cancel')}
        </Link>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!accessToken) return;
    if (!isOAuth && !password) {
      setStatus('error');
      setErrorKey('deleteConfirm.passwordRequired');
      return;
    }
    setStatus('loading');
    try {
      await confirmAccountDeletion(token, isOAuth ? undefined : password);
      setStatus('done');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'TOKEN_EXPIRED') {
        // link expired while the page was open -> switch to the expired screen
        setExpired(true);
        return;
      }
      setStatus('error');
      setErrorKey(
        code === 'WRONG_PASSWORD' ? 'deleteConfirm.wrongPassword' : 'deleteConfirm.error'
      );
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('deleteConfirm.title')}</h1>
      <p className={styles.warning}>{t('deleteConfirm.warning')}</p>

      {!isOAuth && (
        <input
          type="password"
          className={styles.passwordInput}
          placeholder={t('deleteConfirm.passwordLabel')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      )}

      <Button
        variant="danger"
        type="button"
        onClick={handleConfirm}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? t('deleteConfirm.deleting') : t('deleteConfirm.confirmButton')}
      </Button>

      {status === 'error' && <p className={styles.error}>{t(errorKey)}</p>}

      <Link to="/" className={styles.cancelLink}>
        {t('deleteConfirm.cancel')}
      </Link>
    </div>
  );
}

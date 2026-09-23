import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { confirmAccountDeletion } from '../../api/gdpr';
import { useAuth } from '../../context/auth/useAuth';
import styles from './DeleteConfirm.module.css';
import Button from '../../components/ui/Button';

// Page the deletion email link points to: /account/delete-confirm?token=...
export function DeleteConfirmPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleConfirm = async () => {
    if (!token) return;
    setStatus('loading');
    try {
      await confirmAccountDeletion(token);
      setStatus('done');
      logout();
      setTimeout(() => navigate('/'), 3000);
    } catch {
      setStatus('error');
    }
  };

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

  if (status === 'done') {
    return (
      <div className={styles.page}>
        <p>{t('deleteConfirm.done')}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('deleteConfirm.title')}</h1>
      <p className={styles.warning}>{t('deleteConfirm.warning')}</p>

      <Button variant="danger"
        type="button"
        onClick={handleConfirm}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? t('deleteConfirm.deleting') : t('deleteConfirm.confirmButton')}
      </Button>

      {status === 'error' && <p className={styles.error}>{t('deleteConfirm.error')}</p>}

      <Link to="/" className={styles.cancelLink}>
        {t('deleteConfirm.cancel')}
      </Link>
    </div>
  );
}

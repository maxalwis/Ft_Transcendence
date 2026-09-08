import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ProfileModal.module.css';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordModal.mismatchError'));
      return;
    }

    setIsChangingPassword(true);

    try {
      requestClose();
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={styles.passwordOverlay} onClick={requestClose}>
      <div
        data-state={isClosing ? 'closed' : 'open'}
        onAnimationEnd={handleAnimationEnd}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>{t('passwordModal.title')}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={requestClose}
            aria-label={t('passwordModal.close')}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label>
            {t('passwordModal.newPassword')}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('passwordModal.newPasswordPlaceholder')}
            />
          </label>

          <label>
            {t('passwordModal.confirmPassword')}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('passwordModal.confirmPasswordPlaceholder')}
            />
          </label>

          {passwordError && <p className={styles.modalError}>{passwordError}</p>}

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={requestClose}>
              {t('passwordModal.cancel')}
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isChangingPassword}>
              {isChangingPassword ? t('passwordModal.loading') : t('passwordModal.changePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

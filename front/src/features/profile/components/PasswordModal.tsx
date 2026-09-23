import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseBtn } from '../../../types/icons';
import Button from '../../../components/ui/Button';

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
    <div className="glass-modal-overlay" onClick={requestClose}>
      <div
        data-state={isClosing ? 'closed' : 'open'}
        onAnimationEnd={handleAnimationEnd}
        className="glass-modal modalContent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2>{t('passwordModal.title')}</h2>
          <Button variant="icon"
            type="button"
            className="modal-button modal-close"
            onClick={requestClose}
            aria-label={t('passwordModal.close')}
          >
            <CloseBtn />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="modalForm">
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

          {passwordError && <p className="modalError">{passwordError}</p>}

          <div className="modalActions">
            <Button variant="secondary" onClick={requestClose}>
              {t('passwordModal.cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? t('passwordModal.loading') : t('passwordModal.changePassword')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

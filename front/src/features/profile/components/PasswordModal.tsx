import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalLayout from '../../../components/ui/ModalLayout';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { changePassword, ChangePasswordError } from '../../../api/users';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { showSuccess } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
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

    // mêmes règles que le backend (backend/src/users/dto/validation-rules.ts)
    if (newPassword.length < 8 || newPassword.length > 72) {
      setPasswordError(t('passwordModal.lengthError'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordModal.mismatchError'));
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      // Le backend a révoqué toutes les sessions, y compris celle-ci :
      // on déconnecte localement et on demande de se reconnecter.
      showSuccess(t('passwordModal.reloginRequired'));
      onClose();
      logout();
    } catch (err) {
      if (err instanceof ChangePasswordError && err.code === 'INCORRECT_PASSWORD') {
        setPasswordError(t('passwordModal.incorrectPasswordError'));
      } else if (err instanceof ChangePasswordError && err.code === 'NO_PASSWORD_SET') {
        setPasswordError(t('passwordModal.noPasswordSetError'));
      } else if (err instanceof Error && err.message === 'TOO_MANY_ATTEMPTS') {
        setPasswordError(t('passwordModal.tooManyAttempts'));
      } else {
        setPasswordError(t('passwordModal.serverError'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ModalLayout
      portal
      onClose={requestClose}
      title={t('passwordModal.title')}
      dataState={isClosing ? 'closed' : 'open'}
      onAnimationEnd={handleAnimationEnd}
    >
      <form onSubmit={handleSubmit} className="modalForm">
        <TextField
          label={t('passwordModal.currentPassword')}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder={t('passwordModal.currentPasswordPlaceholder')}
          autoComplete="current-password"
        />

        <TextField
          label={t('passwordModal.newPassword')}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t('passwordModal.newPasswordPlaceholder')}
        />

        <TextField
          label={t('passwordModal.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('passwordModal.confirmPasswordPlaceholder')}
          error={passwordError ?? undefined}
        />

        <div className="modalActions">
          <Button variant="secondary" onClick={requestClose}>
            {t('passwordModal.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? t('passwordModal.loading') : t('passwordModal.changePassword')}
          </Button>
        </div>
      </form>
    </ModalLayout>
  );
}

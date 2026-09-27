import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalLayout from '../../../components/ui/ModalLayout';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { changePassword, ChangePasswordError } from '../../../api/users';
import { useNotification } from '../../../context/notifications/useNotification';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const { t } = useTranslation();
  const { showWarning, showSuccess } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showWarning(t('passwordModal.mismatchError'));
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      requestClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess(t('passwordModal.changeSuccess'));
    } catch (err) {
      if (err instanceof ChangePasswordError && err.code === 'INCORRECT_PASSWORD') {
        showWarning(t('passwordModal.incorrectPasswordError'));
      } else if (err instanceof ChangePasswordError && err.code === 'NO_PASSWORD_SET') {
        showWarning(t('passwordModal.noPasswordSetError'));
      } else {
        showWarning(t('passwordModal.serverError'));
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

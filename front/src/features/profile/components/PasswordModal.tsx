import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalLayout from '../../../components/ui/ModalLayout';
import Button from '../../../components/ui/Button';
import { changePassword } from '../../../api/users';
import { useNotification } from '../../../context/notifications/useNotification';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const { t } = useTranslation();
  const { showWarning } = useNotification();
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

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      requestClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showWarning(err instanceof Error ? err.message : t('passwordModal.serverError' ,'Error changing password'));
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
        <label>
          {t('passwordModal.currentPassword')}
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('passwordModal.currentPasswordPlaceholder')}
            autoComplete="current-password"
          />
        </label>

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

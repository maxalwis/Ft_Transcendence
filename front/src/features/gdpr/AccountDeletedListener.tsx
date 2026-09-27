import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/socket/useSocket';
import { useAuth } from '../../context/auth/useAuth';
import { useNotification } from '../../context/notifications/useNotification';

// La suppression est confirmée depuis l'onglet ouvert par le lien de l'email :
// le backend prévient les autres onglets pour qu'ils se déconnectent aussi.
export function AccountDeletedListener() {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { logout } = useAuth();
  const { showWarning } = useNotification();

  useEffect(() => {
    if (!socket) return;

    const handleDeleted = () => {
      logout();
      showWarning(t('deleteConfirm.deletedElsewhere'));
    };

    socket.on('account:deleted', handleDeleted);
    return () => {
      socket.off('account:deleted', handleDeleted);
    };
  }, [socket, logout, showWarning, t]);

  return null;
}

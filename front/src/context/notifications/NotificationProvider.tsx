import React, { useState, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Toast, { type ToastVariant } from '../../components/ui/Toast';
import { NotificationContext } from './useNotification';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [notification, setNotification] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  const showWarning = useCallback(
    (msg: string) => {
      setNotification({
        message: msg || t('notifications.defaultError', 'Une erreur est survenue'),
        variant: 'warning',
      });
    },
    [t]
  );

  const showSuccess = useCallback((msg: string) => {
    setNotification({ message: msg, variant: 'success' });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return React.createElement(
    NotificationContext.Provider,
    { value: { showWarning, showSuccess, clearNotification } },
    children,
    notification &&
      React.createElement(
        'div',
        {
          dir: 'ltr',
          className: 'fixed top-3 left-3 z-9999 pointer-events-auto',
        },
        React.createElement(Toast, {
          message: notification.message,
          variant: notification.variant,
          onClose: clearNotification,
        })
      )
  );
};

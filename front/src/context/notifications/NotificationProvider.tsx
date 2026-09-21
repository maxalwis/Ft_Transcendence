import React, { useState, ReactNode, useCallback } from 'react';
import { WarningNotification } from './WarningNotification';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from './useNotification';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const showWarning = useCallback(
    (msg: string) => {
      setNotificationMessage(msg || t('notifications.defaultError', 'Une erreur est survenue'));
    },
    [t]
  );

  const clearNotification = useCallback(() => {
    setNotificationMessage(null);
  }, []);

  return React.createElement(
    NotificationContext.Provider,
    { value: { showWarning, clearNotification } },
    children,
    notificationMessage &&
      React.createElement(
        'div',
        {
          dir: 'ltr',
          className: 'fixed top-3 left-3 z-9999 pointer-events-auto',
        },
        React.createElement(WarningNotification, {
          message: notificationMessage,
          onClose: clearNotification,
        })
      )
  );
};

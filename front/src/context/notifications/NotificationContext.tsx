import React, { useState, ReactNode, useCallback } from 'react';
import { WarningNotification } from './WarningNotification';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from './useNotification';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = useCallback(
    (msg?: string) => {
      setErrorMessage(msg || t('notifications.defaultError', 'Une erreur est survenue'));
    },
    [t]
  );

  const clearNotification = () => setErrorMessage(null);

  return React.createElement(
    NotificationContext.Provider,
    { value: { showError, clearNotification } },
    children,
    errorMessage &&
      React.createElement(
        'div',
        { dir: 'ltr', className: 'fixed top-4 left-14 z-50 pointer-events-auto' },
        React.createElement(WarningNotification, {
          message: errorMessage,
          onClose: clearNotification,
        })
      )
  );
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WarningNotification } from './WarningNotification';
import './NotificationContext.css';

interface NotificationContextType {
  showError: (message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (msg: string) => setErrorMessage(msg);
  const clearNotification = () => setErrorMessage(null);

  return (
    <NotificationContext.Provider value={{ showError, clearNotification }}>
      {children}

      {/* Renders once at top-left, shifted to left-14 to clear your 30px button */}
      {errorMessage && (
        <div className="fixed top-4 left-14 z-50 pointer-events-auto">
          <WarningNotification message={errorMessage} onClose={clearNotification} />
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

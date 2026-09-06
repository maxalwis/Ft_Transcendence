import { createContext, useContext } from 'react';

export interface NotificationContextType {
  showError: (message?: string) => void;
  clearNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

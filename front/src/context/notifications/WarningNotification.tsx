import React, { useEffect, useState, useCallback } from 'react';
import styles from './NotificationProvider.module.css';
import { CloseIcon, WarningIcon } from '../../types/icons';
import Button from '../../components/ui/Button';

interface NotificationProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const WarningNotification = ({ message, onClose, duration = 5000 }: NotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [prevMessage, setPrevMessage] = useState(message);

  // Synchronously reset `isExiting` during render when a new message arrives
  if (message !== prevMessage) {
    setPrevMessage(message);
    setIsExiting(false);
  }

  // Wrap dismiss handler in useCallback to satisfy hook dependencies
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, handleDismiss]);

  if (!message) return null;

  return (
    <div
      className={`${styles.warning} ${isExiting ? styles.toastSlideOut : styles.toastSlideIn} max-w-md`}
    >
      <WarningIcon className="h-5 w-5" />

      <span className={styles.message}>{message}</span>

      <Button
        variant="icon"
        type="button"
        onClick={handleDismiss}
        aria-label="Close notification"
        className="modal-button modal-close"
      >
        <CloseIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

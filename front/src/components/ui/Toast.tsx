import { useEffect, useState, useCallback } from 'react';
import { CloseIcon, WarningIcon, CheckIcon, InfoIcon } from '../../types/icons';
import Button from './Button';

export type ToastVariant = 'warning' | 'success' | 'error' | 'info';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
  variant?: ToastVariant;
}

const toastIcon: Record<ToastVariant, typeof WarningIcon> = {
  warning: WarningIcon,
  error: WarningIcon,
  success: CheckIcon,
  info: InfoIcon,
};

export default function Toast({
  message,
  onClose,
  duration = 5000,
  variant = 'warning',
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [prevMessage, setPrevMessage] = useState(message);

  // Synchronously reset `isExiting` during render when a new message arrives
  if (message !== prevMessage) {
    setPrevMessage(message);
    setIsExiting(false);
  }

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

  const Icon = toastIcon[variant];

  return (
    <div
      className={`ds-toast ds-toast-${variant} ${isExiting ? 'ds-toast-slide-out' : 'ds-toast-slide-in'} max-w-md`}
    >
      <Icon className="h-5 w-5" />

      <span className="ds-toast-message">{message}</span>

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
}

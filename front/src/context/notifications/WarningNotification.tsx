import React, { useEffect, useState, useCallback } from 'react';
import styles from './NotificationProvider.module.css';
import { CloseBtn } from '../../types/icons';
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
      className={`${styles.warning} ${
        isExiting ? 'toast-slide-out' : 'toast-slide-in'
      } flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[8px] bg-[rgba(255,248,225,0.7)] border border-[rgba(245,158,11,0.35)] text-amber-950 font-sans max-w-md pointer-events-auto transition-all duration-300`}
    >
      <svg
        className="h-5 w-5 shrink-0 text-amber-600"
        viewBox="0 0 512.055 512.055"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="translate(-1)">
          <g>
            <g>
              <path d="M257.028,384.028c-11.776,0-21.333,9.557-21.333,21.333s9.557,21.333,21.333,21.333s21.333-9.557,21.333-21.333S268.804,384.028,257.028,384.028z" />
              <path d="M510.775,481.154L276.109,11.82c-7.862-15.724-30.3-15.724-38.162,0L3.28,481.154c-7.092,14.185,3.222,30.874,19.081,30.874h469.333C507.553,512.028,517.868,495.338,510.775,481.154z M56.879,469.361L257.028,69.064l200.149,400.297H56.879z" />
              <path d="M235.694,192.028v149.333c0,11.782,9.551,21.333,21.333,21.333s21.333-9.551,21.333-21.333V192.028c0-11.782-9.551-21.333-21.333-21.333S235.694,180.245,235.694,192.028z" />
            </g>
          </g>
        </g>
      </svg>

      <span className="text-sm font-medium leading-snug flex-1">{message}</span>

      <Button variant="icon"
        type="button"
        onClick={handleDismiss}
        aria-label="Close notification"
        className="modal-button modal-close-inline"
      >
        <CloseBtn />
      </Button>
    </div>
  );
};

import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const WarningNotification: React.FC<NotificationProps> = ({
  message,
  onClose,
  duration = 5000,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Trigger the exit animation before removing from DOM
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false); // Reset for next time
    }, 300); // Duration matches slideOutToLeft animation
  };

  useEffect(() => {
    if (!message) return;

    // Reset exit state on new message
    setIsExiting(false);

    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;

  return (
    <div
      className={`glassmorphism-warning ${
        isExiting ? 'toast-slide-out' : 'toast-slide-in'
      } flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[8px] bg-[rgba(255,248,225,0.7)] border border-[rgba(245,158,11,0.35)] text-amber-950 font-sans max-w-md pointer-events-auto transition-all duration-300`}
    >
      <span className="text-base leading-none select-none">⚠️</span>
      <span className="text-sm font-medium leading-snug flex-1">{message}</span>
      <button
        onClick={handleDismiss}
        className="text-amber-900/60 hover:text-amber-950 hover:bg-[rgba(245,158,11,0.15)] rounded-lg p-1 transition-colors border-0 cursor-pointer flex items-center justify-center font-bold"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};
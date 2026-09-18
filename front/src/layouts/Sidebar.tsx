import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../features/map/Map.module.css';

interface SideBarProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function SideBar({ onClose, children }: SideBarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  const handleAnimationEnd = () => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      onAnimationEnd={handleAnimationEnd}
      className={`glass-panel ${styles.sidebarModal} fixed top-15 right-3 bottom-15 w-[20vw] rounded-xl p-5 shadow-lg z-1000 flex flex-col`}
    >
      {/* Close Button */}
      <div className="shrink-0">
        <button
          type="button"
          aria-label={t('sidebar.close', 'Close')}
          onClick={() => setIsOpen(false)}
          className="modal-button modal-close"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sidebar content */}
      {children}
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../features/map/Map.module.css';

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SideBar({ isOpen, onToggle, onClose, children }: SideBarProps) {
  const { t } = useTranslation();

  return (
    <>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className={`glass-panel ${styles.sidebarModal} fixed top-15 right-3 bottom-15 w-[20vw] rounded-xl p-5 shadow-lg z-1000 flex flex-col`}
      >
        {/* Close Button */}
        <div className="shrink-0">
          <button
            type="button"
            aria-label={t('sidebar.close', 'Close')}
            onClick={onClose}
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

        {children}
      </div>

      <button
        type="button"
        data-state={isOpen ? 'open' : 'closed'}
        aria-label={
          isOpen ? t('sidebar.collapse', 'Collapse sidebar') : t('sidebar.expand', 'Expand sidebar')
        }
        onClick={onToggle}
        className={styles.sidebarToggle}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
        </svg>
      </button>
    </>
  );
}

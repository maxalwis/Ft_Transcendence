import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../features/map/Map.module.css';
import { BackBtn, CloseBtn } from '../types/icons';
import Button from '../components/ui/Button';

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  type?: 'results' | 'event';
}

export default function SideBar({ isOpen, onToggle, onClose, children, type }: SideBarProps) {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
  };

  const sidebarIsOpen = isOpen && !isClosing;

  return (
    <>
      <div
        data-state={sidebarIsOpen ? 'open' : 'closed'}
        onAnimationEnd={handleAnimationEnd}
        data-sidebar-type={type}
        className={`glass-panel ${styles.sidebarModal} fixed top-15 right-3 bottom-15 w-[20vw] rounded-xl shadow-lg z-1000 flex flex-col`}
      >
        <div className="shrink-0">
          <Button
            variant="icon"
            type="button"
            aria-label={t('sidebar.close', 'Close')}
            onClick={handleClose}
            className="modal-button modal-close"
          >
            <CloseBtn />
          </Button>
        </div>

        {children}
      </div>

      <Button
        variant="icon"
        type="button"
        data-state={sidebarIsOpen ? 'open' : 'closed'}
        aria-label={
          sidebarIsOpen
            ? t('sidebar.collapse', 'Collapse sidebar')
            : t('sidebar.expand', 'Expand sidebar')
        }
        onClick={onToggle}
        className={styles.sidebarToggle}
      >
        <BackBtn className={`h-4 w-4 transition-transform ${sidebarIsOpen ? 'rotate-180' : ''}`} />
      </Button>
    </>
  );
}

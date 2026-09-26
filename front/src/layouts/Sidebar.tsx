import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../features/map/Map.module.css';
import { BackIcon } from '../types/icons';
import Button from '../components/ui/Button';
import ModalLayout from '../components/ui/ModalLayout';

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export default function SideBar({ isOpen, onToggle, onClose, onBack, children }: SideBarProps) {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  const sidebarIsOpen = isOpen && !isClosing;

  return (
    <>
      <ModalLayout
        variant="sidebar"
        onClose={onClose}
        onBack={onBack}
        dataState={sidebarIsOpen ? 'open' : 'closed'}
        onAnimationEnd={handleAnimationEnd}
        bodyClassName="flex flex-col"
      >
        {children}
      </ModalLayout>

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
        <BackIcon className={`h-4 w-4 transition-transform ${sidebarIsOpen ? 'rotate-180' : ''}`} />
      </Button>
    </>
  );
}

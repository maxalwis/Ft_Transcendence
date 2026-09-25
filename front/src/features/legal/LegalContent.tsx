import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import styles from './Legal.module.css';
import { CloseIcon } from '../../types/icons';
import Button from '../../components/ui/Button';

interface LegalContentProps {
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export default function LegalContent({ initialTab = 'privacy', onClose }: LegalContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <>
      <Button
        variant="icon"
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        className="modal-button modal-close"
      >
        <CloseIcon className="h-4 w-4" />
      </Button>

      <div className={styles.tabNav}>
        <Button
          variant="primary"
          type="button"
          className={`${styles.tabButton} ${activeTab === 'privacy' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          {t('legal.privacy')}
        </Button>

        <Button
          variant="primary"
          type="button"
          className={`${styles.tabButton} ${activeTab === 'terms' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          {t('legal.terms')}
        </Button>
      </div>

      <div className={styles.scrollableContent}>
        {activeTab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </>
  );
}

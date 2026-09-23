import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import styles from './Legal.module.css';
import { closeBtn } from '../../types/icons';

interface LegalContentProps {
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export default function LegalContent({ initialTab = 'privacy', onClose }: LegalContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('authModal.close')}
        className="modal-button modal-close"
      >
        {closeBtn}
      </button>

      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'privacy' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          {t('legal.privacy')}
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'terms' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          {t('legal.terms')}
        </button>
      </div>

      <div className={styles.scrollableContent}>
        {activeTab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </>
  );
}

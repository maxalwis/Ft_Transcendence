import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import styles from './Legal.module.css';

interface LegalContentProps {
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export default function LegalContent({
  initialTab = 'privacy',
  onClose,
}: LegalContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="relative p-6 max-w-2xl w-full max-h-[85vh] flex flex-col">
      <button
        type="button"
        onClick={onClose}
        aria-label={t('authModal.close')}
        className="modal-close"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === 'privacy' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('privacy')}
        >
          {t('legal.privacy')}
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === 'terms' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('terms')}
        >
          {t('legal.terms')}
        </button>
      </div>

      <div className={styles.scrollableContent}>
        {activeTab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </div>
  );
}
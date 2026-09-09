import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import styles from './Legal.module.css';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }: LegalModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="glass-modal-overlay">
      <div className="glass-modal relative p-6 max-w-2xl w-full max-h-[85vh] flex flex-col glass-animate-in">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('authModal.close')}
          className="unstyled absolute top-4 right-4 text-xl font-bold cursor-pointer opacity-70 hover:opacity-100"
        >
          ✕
        </button>

        {/* Navigation Tabs */}
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

        {/* Scrollable Container */}
        <div className={styles.scrollableContent}>
          {activeTab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
        </div>
      </div>
    </div>
  );
}

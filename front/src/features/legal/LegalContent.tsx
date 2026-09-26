import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import styles from './Legal.module.css';
import ModalLayout, { type ModalShellProps } from '../../components/ui/ModalLayout';
import Button from '../../components/ui/Button';

interface LegalContentProps {
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
  onBack?: () => void;
  shell?: ModalShellProps;
}

export default function LegalContent({
  initialTab = 'privacy',
  onClose,
  onBack,
  shell,
}: LegalContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <ModalLayout onClose={onClose} onBack={onBack} variant="legal" {...shell}>
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
    </ModalLayout>
  );
}

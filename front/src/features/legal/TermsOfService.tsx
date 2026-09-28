import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Legal.module.css';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className={`${styles.legalContainer} text-start`}>
      <h1>{t('legalContent.termsTitle')}</h1>
      <p>{t('legalContent.termsSubtitle')}</p>

      <h2>{t('legalContent.termsSection1Title')}</h2>
      <p>{t('legalContent.termsText')}</p>

      <h2>{t('legalContent.termsSection2Title')}</h2>
      <p>{t('legalContent.termsUserConduct')}</p>

      <h2>{t('legalContent.termsSection3Title')}</h2>
      <p>{t('legalContent.termsAccountResponsibility')}</p>
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Legal.module.css';

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div 
      className={`legal-container ${isArabic ? 'text-right' : 'text-left'}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <h1>{t('legalContent.privacyTitle')}</h1>
      <p>{t('legalContent.privacySubtitle')}</p>

      <h2>{t('legalContent.section1Title')}</h2>
      <p>{t('legalContent.privacyText')}</p>

      <h2>{t('legalContent.section2Title')}</h2>
      <p>{t('legalContent.privacyUseText')}</p>

      <h2>{t('legalContent.section3Title')}</h2>
      <p>{t('legalContent.privacySecurityText')}</p>
    </div>
  );
}
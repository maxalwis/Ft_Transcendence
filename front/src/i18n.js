import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Assure-toi que ces chemins correspondent bien à l'emplacement réel de tes fichiers json
import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationAR from './locales/ar.json';

const resources = {
  fr: { translation: translationFR },
  en: { translation: translationEN },
  es: { translation: translationES },
  ar: { translation: translationAR },
};

// Function to toggle dir and lang attributes on <html>
const updateDocumentAttributes = (lng) => {
  const html = document.documentElement;
  if (lng === 'ar') {
    html.setAttribute('dir', 'rtl');
  } else {
    html.setAttribute('dir', 'ltr');
  }
  html.setAttribute('lang', lng);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

// Set attributes immediately when the page loads
updateDocumentAttributes(i18n.language);

// Update attributes whenever the user switches language
i18n.on('languageChanged', (lng) => {
  updateDocumentAttributes(lng);
});

export default i18n;

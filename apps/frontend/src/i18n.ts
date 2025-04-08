import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '@frontend/locales/en/translation.json';
import translationPL from '@frontend/locales/pl/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  pl: {
    translation: translationPL,
  },
};

const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

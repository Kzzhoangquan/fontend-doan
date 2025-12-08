'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations từ index files
import enTranslations from './locales/en';
import viTranslations from './locales/vi';

// Initialize i18n only on client side
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: enTranslations,
        },
        vi: {
          translation: viTranslations,
        },
      },
      fallbackLng: 'vi',
      lng: 'vi',
      debug: false,
      
      interpolation: {
        escapeValue: false,
      },

      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
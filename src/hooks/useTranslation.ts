'use client';

import { useTranslation as useI18nextTranslation } from 'react-i18next';

export type Locale = 'en' | 'vi';
export const defaultLocale: Locale = 'vi';

/**
 * Custom translation hook that wraps react-i18next
 * @deprecated Use useI18n from '@/hooks/useI18n' instead for better type safety
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nextTranslation();
  const locale = (i18n.language as Locale) || defaultLocale;

  const changeLocale = (newLocale: Locale) => {
    i18n.changeLanguage(newLocale);
    localStorage.setItem('i18nextLng', newLocale);
  };

  return {
    t,
    locale,
    changeLocale,
  };
};
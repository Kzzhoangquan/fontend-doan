import vi from './locales/vi.json';
import en from './locales/en.json';
import { Locale } from './config';

const translations = {
  vi,
  en,
};

export const getTranslation = (locale: Locale) => {
  return translations[locale] || translations.vi;
};

export const t = (locale: Locale, key: string): string => {
  const keys = key.split('.');
  let value: any = getTranslation(locale);
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
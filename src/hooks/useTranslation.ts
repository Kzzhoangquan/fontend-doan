'use client';

import { useState } from 'react';
import { Locale, defaultLocale } from '@/i18n/config';
import { t as translate } from '@/i18n';

export const useTranslation = () => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = (key: string) => translate(locale, key);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return {
    t,
    locale,
    changeLocale,
  };
};
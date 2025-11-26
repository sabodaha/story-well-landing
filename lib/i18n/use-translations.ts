'use client';

import { useParams } from 'next/navigation';
import { Locale } from './config';
import { translations } from './translations';

export function useTranslations() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  
  return translations[locale] || translations.en;
}


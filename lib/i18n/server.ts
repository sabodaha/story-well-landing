/**
 * Server-side translation utilities
 * Use this instead of useTranslations hook in server components
 */

import { Locale } from './config';
import { translations } from './translations';

/**
 * Get translations for a specific locale (server-side)
 */
export function getTranslations(locale: Locale = 'en') {
  const safeLocale = (locale in translations ? locale : 'en') as keyof typeof translations;
  return translations[safeLocale];
}





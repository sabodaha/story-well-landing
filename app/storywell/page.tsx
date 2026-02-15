'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config';

/**
 * Detect the best matching locale from the browser's language preferences.
 * Checks navigator.languages (ordered list) first, then navigator.language.
 * Matches the language prefix (e.g. "de-AT" → "de").
 */
function detectLocale(): Locale {
  const candidates: string[] = [];

  if (typeof navigator !== 'undefined') {
    if (navigator.languages?.length) {
      candidates.push(...navigator.languages);
    } else if (navigator.language) {
      candidates.push(navigator.language);
    }
  }

  for (const candidate of candidates) {
    const code = candidate.toLowerCase().split('-')[0];
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }
  }

  return defaultLocale;
}

export default function StorywellRedirect() {
  const router = useRouter();

  useEffect(() => {
    const locale = detectLocale();
    router.replace(`/${locale}`);
  }, [router]);

  return null;
}

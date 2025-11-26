export const locales = ['en', 'de', 'es', 'fr', 'it', 'ru', 'tr', 'uk'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  de: { native: 'Deutsch', english: 'German' },
  es: { native: 'Español', english: 'Spanish' },
  fr: { native: 'Français', english: 'French' },
  it: { native: 'Italiano', english: 'Italian' },
  ru: { native: 'Русский', english: 'Russian' },
  tr: { native: 'Türkçe', english: 'Turkish' },
  uk: { native: 'Українська', english: 'Ukrainian' },
};


'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import './globals.css';
import { Button } from '@/components/ui/button';
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config';
import { translations } from '@/lib/i18n/translations';

// This page is emitted as out/404.html and served for ANY unmatched path, so it renders
// outside app/[locale]/layout.tsx — the only place that supplies <html>/<body>, globals.css
// and the next/font variables. It therefore has to supply its own document shell.
// next/font loaders cannot be called from a client component, so the font variables fall
// back to a system stack rather than the self-hosted Nunito/Lexend used site-wide.
const fontFallback = {
  '--font-nunito': '"Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
  '--font-lexend': '"Lexend", "Segoe UI", system-ui, -apple-system, sans-serif',
} as CSSProperties;

function localeFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return locales.includes(firstSegment as Locale)
    ? (firstSegment as Locale)
    : defaultLocale;
}

export default function NotFound() {
  // useTranslations() reads useParams(), which has no locale on an unmatched path, so the
  // locale is recovered from the URL after hydration. Until then the defaultLocale copy renders.
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocale(localeFromPathname(window.location.pathname));
  }, []);

  const t = translations[locale];
  const homeHref = `/${locale}/`;
  const storiesHref = `/${locale}/stories/`;

  return (
    <html lang={locale} style={fontFallback}>
      <head>
        <title>Page not found — Storywell</title>
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5">
          <header className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-16">
                <a
                  href={homeHref}
                  className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <img
                    src="/website-icon.png"
                    alt=""
                    className="h-10 w-10 rounded-lg"
                  />
                  <span className="text-2xl font-bold text-magic-gradient">
                    Storywell
                  </span>
                </a>
              </div>
            </div>
          </header>

          <main
            id="main-content"
            className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-xl mx-auto text-center">
              <p
                aria-hidden="true"
                className="text-7xl sm:text-8xl font-extrabold text-magic-gradient leading-none"
              >
                404
              </p>

              <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-foreground text-balance">
                This page has wandered off
              </h1>

              <p className="mt-4 text-base sm:text-lg text-muted-foreground text-pretty">
                The link you followed may be out of date or mistyped. The stories
                are all still here.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-magic-gradient text-white hover:opacity-90"
                >
                  <a href={storiesHref}>{t.navStories}</a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href={homeHref}>{t.backToHome}</a>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

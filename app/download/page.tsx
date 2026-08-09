'use client';

import { useEffect, useState } from 'react';
import { detectPlatform, type Platform } from '@/hooks/use-platform';
import { StoreBadges } from '@/components/store-badges';
import { BookOpen, Check, Copy } from 'lucide-react';

const APPLE_APP_ID = '6759845142';
const APP_STORE_URL = `https://apps.apple.com/app/id${APPLE_APP_ID}`;
const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.dartim_media.storywell';

// Promo campaigns: channel word → the custom offer codes created in
// App Store Connect and Play Console. A word must exist in BOTH consoles
// before it is distributed. iOS codes are activated via the redeem URL;
// Android custom codes can only be entered inside the app's purchase
// sheet, so Android users see the code + instructions instead of a
// silent redirect.
type Promo = { ios: string; android: string; locale: keyof typeof STRINGS };

const PROMOS: Record<string, Promo> = {
  KAZKA: { ios: 'KAZKA', android: 'KAZKA', locale: 'uk' },
};

const STRINGS = {
  uk: {
    promoTitle: 'Ваш промокод',
    promoSubtitle: '3 місяці Premium безкоштовно',
    copy: 'Скопіювати код',
    copied: 'Скопійовано!',
    stepsTitle: 'Як активувати:',
    steps: [
      'Встановіть Storywell із Google Play',
      'Відкрийте застосунок і перейдіть на екран Premium',
      'У вікні оплати Google Play натисніть «Використати код»',
      'Введіть код — пробний період коштує 0',
    ],
    install: 'Відкрити Google Play',
    autorenew:
      'Після безкоштовного періоду підписка продовжується платно. Автопродовження можна вимкнути одразу після активації — Premium однаково діятиме всі 3 місяці.',
    desktopHint: 'Відкрийте цю сторінку на телефоні, щоб активувати код.',
  },
  en: {
    promoTitle: 'Your promo code',
    promoSubtitle: '3 months of Premium for free',
    copy: 'Copy code',
    copied: 'Copied!',
    stepsTitle: 'How to activate:',
    steps: [
      'Install Storywell from Google Play',
      'Open the app and go to the Premium screen',
      'In the Google Play payment sheet, tap "Redeem code"',
      'Enter the code — the trial period costs 0',
    ],
    install: 'Open Google Play',
    autorenew:
      'After the free period the subscription renews as paid. You can turn off auto-renewal right after activating — Premium still lasts the full 3 months.',
    desktopHint: 'Open this page on your phone to activate the code.',
  },
} as const;

function appleRedeemUrl(code: string): string {
  return `https://apps.apple.com/redeem?ctx=offercodes&id=${APPLE_APP_ID}&code=${encodeURIComponent(code)}`;
}

// The referrer lands in the Play Install Referrer API, so Firebase
// Analytics attributes each install to its promo campaign for free.
function playPromoUrl(word: string): string {
  const referrer = `utm_source=promo_${word.toLowerCase()}&utm_medium=smart_link&utm_campaign=offer_codes`;
  return `${GOOGLE_PLAY_URL}&referrer=${encodeURIComponent(referrer)}`;
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [promoWord, setPromoWord] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    const raw = new URLSearchParams(window.location.search).get('promo');
    const word = raw ? raw.trim().toUpperCase() : null;
    const promo = word && PROMOS[word] ? word : null;

    setPlatform(p);
    setPromoWord(promo);

    if (p === 'ios') {
      window.location.href = promo
        ? appleRedeemUrl(PROMOS[promo].ios)
        : APP_STORE_URL;
    } else if (p === 'android' && !promo) {
      window.location.href = GOOGLE_PLAY_URL;
    }
    // Android with a promo: no redirect — the user must see the code
    // before leaving for the Play purchase sheet, where they will type it.
  }, []);

  const promo = promoWord ? PROMOS[promoWord] : null;
  const t = STRINGS[promo?.locale ?? 'en'];

  const copyCode = async () => {
    if (!promo) return;
    try {
      await navigator.clipboard.writeText(promo.android);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (old WebView) — the code stays visible.
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 py-12">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-magic-gradient">
            Storywell
          </span>
        </div>

        {promo && platform !== 'ios' ? (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {t.promoTitle}
              </h1>
              <p className="text-muted-foreground">{t.promoSubtitle}</p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-5 space-y-3">
              <div className="text-4xl font-bold tracking-[0.3em] text-primary">
                {promo.android}
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? t.copied : t.copy}
              </button>
            </div>

            {platform === 'android' ? (
              <>
                <div className="text-left space-y-2">
                  <p className="font-semibold text-foreground">
                    {t.stepsTitle}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {t.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <a
                  href={playPromoUrl(promoWord!)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {t.install}
                </a>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">{t.desktopHint}</p>
                <StoreBadges className="justify-center" />
              </>
            )}

            <p className="text-xs text-muted-foreground">{t.autorenew}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">
              Download Storywell
            </h1>
            <p className="text-muted-foreground">
              Beautifully illustrated children&apos;s stories in 8 languages.
              Choose your platform:
            </p>

            <StoreBadges className="justify-center" />

            <p className="text-sm text-muted-foreground pt-4">
              Free to download. No ads. Safe for kids.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

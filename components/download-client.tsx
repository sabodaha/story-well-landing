'use client';

import { useEffect, useRef, useState } from 'react';
import { detectPlatform, type Platform } from '@/hooks/use-platform';
import { StoreBadges } from '@/components/store-badges';
import { Check, Copy } from 'lucide-react';

const APPLE_APP_ID = '6759845142';
const APP_STORE_URL = `https://apps.apple.com/app/id${APPLE_APP_ID}`;
const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.dartim_media.storywell';

// Promo campaigns: channel word → the offer codes created in App Store
// Connect and Play Console. A word must exist in BOTH consoles before it
// is distributed. iOS activates via the redeem URL; Android one-tap
// fetches a one-time code from promoDispenser and deep-links into the
// Play redeem flow, falling back to the manual custom-code steps.
type Promo = { ios: string; android: string };

const PROMOS: Record<string, Promo> = {
  KAZKA: { ios: 'KAZKA', android: 'KAZKA' },
};

const PROMO_CLAIM_URL =
  'https://us-central1-kidsstoriesapp.cloudfunctions.net/promoDispenser/claim';

const PROMO_HIT_URL =
  'https://us-central1-kidsstoriesapp.cloudfunctions.net/promoDispenser/hit';

// One-tap redeem via play.google.com/redeem is PARKED: on real devices the
// Play redeem flow confirms the 90-day promo but then routes the purchase
// to the ANNUAL base plan with its 7-day trial (device-verified 2026-08-14),
// putting users one tap away from a yearly charge. Until that flow is
// verified safe, Android always uses the manual in-app custom-code path,
// where the promo provably applies to the monthly (backwards-compatible)
// base plan. The dispenser Cloud Function and code pool stay deployed for
// a future re-enable.
// Re-enabled 2026-08-14: codes now come from the dedicated
// storywell_premium_gift product (single monthly base plan), so the Play
// redeem flow has no annual plan to mis-route to — device-verified:
// "90-day trial → €3.99+tax/month".
const ANDROID_ONE_TAP_REDEEM = true as boolean;

type Locale = 'uk' | 'ru' | 'de' | 'en';

// Page language follows the visitor's browser language (uk/ru/de),
// English for everyone else. `?lang=` overrides for testing.
function detectLocale(): Locale {
  const candidates = [
    new URLSearchParams(window.location.search).get('lang') || '',
    ...(navigator.languages ?? [navigator.language ?? '']),
  ];
  for (const candidate of candidates) {
    const base = candidate.toLowerCase().split('-')[0];
    if (base === 'uk' || base === 'ru' || base === 'de' || base === 'en') {
      return base;
    }
  }
  return 'en';
}

const STRINGS: Record<
  Locale,
  {
    tagline: string;
    giftTitle: string;
    giftSubtitle: string;
    benefits: string[];
    activate: string;
    claiming: string;
    fallbackNote: string;
    copy: string;
    copied: string;
    stepsTitle: string;
    steps: string[];
    install: string;
    autorenew: string;
    desktopHint: string;
    downloadTitle: string;
    downloadSubtitle: string;
    trust: string;
  }
> = {
  uk: {
    tagline: 'Ілюстровані казки та аудіоказки — 8 мовами',
    giftTitle: 'Подарунок для вашої родини',
    giftSubtitle: '3 місяці Premium безкоштовно',
    benefits: [
      'Ілюстровані казки, які читають себе самі',
      'Миттєве перемикання між 8 мовами',
      'Аудіоказки та спокійна музика для сну',
    ],
    activate: 'Активувати 3 місяці безкоштовно',
    claiming: 'Отримуємо ваш код…',
    fallbackNote: 'Не вдалося активувати автоматично. Активуйте вручну:',
    copy: 'Скопіювати код',
    copied: 'Скопійовано!',
    stepsTitle: 'Як активувати:',
    steps: [
      'Встановіть Storywell із Google Play',
      'Відкрийте застосунок і перейдіть на екран Premium',
      'Оберіть МІСЯЧНИЙ план підписки',
      'У вікні оплати Google Play натисніть «Використати код»',
      'Введіть код — 90 днів коштують 0',
    ],
    install: 'Відкрити Google Play',
    autorenew:
      'Після безкоштовного періоду підписка продовжується платно. Автопродовження можна вимкнути одразу після активації — Premium однаково діятиме всі 3 місяці.',
    desktopHint: 'Відкрийте цю сторінку на телефоні, щоб активувати подарунок.',
    downloadTitle: 'Завантажте Storywell',
    downloadSubtitle:
      'Ілюстровані дитячі казки 8 мовами. Без реклами, працює офлайн.',
    trust: 'Без реклами · Безпечно для дітей · Працює офлайн',
  },
  ru: {
    tagline: 'Иллюстрированные сказки и аудиосказки — на 8 языках',
    giftTitle: 'Подарок для вашей семьи',
    giftSubtitle: '3 месяца Premium бесплатно',
    benefits: [
      'Иллюстрированные сказки, которые читают себя сами',
      'Мгновенное переключение между 8 языками',
      'Аудиосказки и спокойная музыка для сна',
    ],
    activate: 'Активировать 3 месяца бесплатно',
    claiming: 'Получаем ваш код…',
    fallbackNote: 'Не удалось активировать автоматически. Активируйте вручную:',
    copy: 'Скопировать код',
    copied: 'Скопировано!',
    stepsTitle: 'Как активировать:',
    steps: [
      'Установите Storywell из Google Play',
      'Откройте приложение и перейдите на экран Premium',
      'Выберите МЕСЯЧНЫЙ план подписки',
      'В окне оплаты Google Play нажмите «Использовать код»',
      'Введите код — 90 дней стоят 0',
    ],
    install: 'Открыть Google Play',
    autorenew:
      'После бесплатного периода подписка продлевается платно. Автопродление можно отключить сразу после активации — Premium всё равно будет действовать все 3 месяца.',
    desktopHint: 'Откройте эту страницу на телефоне, чтобы активировать подарок.',
    downloadTitle: 'Скачайте Storywell',
    downloadSubtitle:
      'Иллюстрированные детские сказки на 8 языках. Без рекламы, работает офлайн.',
    trust: 'Без рекламы · Безопасно для детей · Работает офлайн',
  },
  de: {
    tagline: 'Illustrierte Gutenachtgeschichten & Hörbücher — in 8 Sprachen',
    giftTitle: 'Ein Geschenk für Ihre Familie',
    giftSubtitle: '3 Monate Premium gratis',
    benefits: [
      'Illustrierte Geschichten, die sich selbst vorlesen',
      'Sofortiger Wechsel zwischen 8 Sprachen',
      'Hörbücher und ruhige Einschlafmusik',
    ],
    activate: '3 Gratis-Monate aktivieren',
    claiming: 'Ihr Code wird geladen…',
    fallbackNote:
      'Automatische Aktivierung fehlgeschlagen. Bitte manuell aktivieren:',
    copy: 'Code kopieren',
    copied: 'Kopiert!',
    stepsTitle: 'So aktivieren Sie:',
    steps: [
      'Installieren Sie Storywell aus Google Play',
      'Öffnen Sie die App und gehen Sie zum Premium-Bildschirm',
      'Wählen Sie den MONATS-Plan',
      'Tippen Sie im Google-Play-Zahlungsfenster auf „Code einlösen“',
      'Geben Sie den Code ein — 90 Tage kosten 0 €',
    ],
    install: 'Google Play öffnen',
    autorenew:
      'Nach dem Gratiszeitraum verlängert sich das Abo kostenpflichtig. Die Verlängerung können Sie direkt nach der Aktivierung deaktivieren — Premium bleibt trotzdem die vollen 3 Monate aktiv.',
    desktopHint:
      'Öffnen Sie diese Seite auf Ihrem Handy, um das Geschenk zu aktivieren.',
    downloadTitle: 'Storywell herunterladen',
    downloadSubtitle:
      'Illustrierte Kindergeschichten in 8 Sprachen. Ohne Werbung, offline nutzbar.',
    trust: 'Ohne Werbung · Sicher für Kinder · Offline nutzbar',
  },
  en: {
    tagline: 'Illustrated stories & audiobooks — in 8 languages',
    giftTitle: 'A gift for your family',
    giftSubtitle: '3 months of Premium for free',
    benefits: [
      'Illustrated stories that read themselves',
      'Instant switching between 8 languages',
      'Audiobooks and calm sleep music',
    ],
    activate: 'Activate 3 free months',
    claiming: 'Getting your code…',
    fallbackNote: "Automatic activation didn't work. Activate manually:",
    copy: 'Copy code',
    copied: 'Copied!',
    stepsTitle: 'How to activate:',
    steps: [
      'Install Storywell from Google Play',
      'Open the app and go to the Premium screen',
      'Select the MONTHLY plan',
      'In the Google Play payment sheet, tap "Redeem code"',
      'Enter the code — 90 days cost 0',
    ],
    install: 'Open Google Play',
    autorenew:
      'After the free period the subscription renews as paid. You can turn off auto-renewal right after activating — Premium still lasts the full 3 months.',
    desktopHint: 'Open this page on your phone to activate the gift.',
    downloadTitle: 'Download Storywell',
    downloadSubtitle:
      'Illustrated children’s stories in 8 languages. No ads, works offline.',
    trust: 'No ads · Safe for kids · Works offline',
  },
};

const SPARKLES: Array<{ top: string; left: string; cls: string }> = [
  { top: '14%', left: '10%', cls: 'text-lg opacity-70' },
  { top: '26%', left: '84%', cls: 'text-sm opacity-60 animate-pulse' },
  { top: '8%', left: '68%', cls: 'text-xs opacity-50' },
  { top: '58%', left: '6%', cls: 'text-sm opacity-50 animate-pulse' },
  { top: '66%', left: '90%', cls: 'text-lg opacity-60' },
  { top: '40%', left: '46%', cls: 'text-[10px] opacity-40' },
];

function appleRedeemUrl(code: string): string {
  return `https://apps.apple.com/redeem?ctx=offercodes&id=${APPLE_APP_ID}&code=${encodeURIComponent(code)}`;
}

// Placement id from ?src= (e.g. /kazka?src=wiesbaden), so one Telegram
// community can be told apart from another. Kept to a safe charset because
// it is echoed into the Play referrer and the dispenser payload.
function sanitizeSrc(raw: string | null): string | null {
  if (!raw) return null;
  return raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || null;
}

// Counts one landing-page visit against its placement. sendBeacon is used
// because iPhone visitors are redirected to the App Store in the same tick — a
// normal fetch would be cancelled before it left the browser. Aggregate-only
// on the server: no identifiers are sent, and the counter never blocks the page.
function reportHit(
  campaign: string,
  src: string | null,
  platform: Platform | null
): void {
  const payload = JSON.stringify({
    campaign: campaign.toLowerCase(),
    src,
    platform: platform ?? 'desktop',
  });
  // text/plain keeps the request CORS-simple. Anything else (application/json
  // included) makes the browser preflight it, and preflighted beacons are
  // dropped silently — verified against production on 2026-08-24.
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        PROMO_HIT_URL,
        new Blob([payload], { type: 'text/plain;charset=UTF-8' })
      );
      if (sent) return;
    }
  } catch {
    // Fall through to fetch below.
  }
  void fetch(PROMO_HIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

// The referrer lands in the Play Install Referrer API, so Firebase
// Analytics attributes each install to its promo campaign for free.
// iOS carries no equivalent — Apple's redeem URL takes no parameters — so
// src attribution on iPhone is only visible as dispenser/click counts.
function playPromoUrl(word: string, src: string | null): string {
  const referrer = [
    `utm_source=promo_${word.toLowerCase()}`,
    'utm_medium=smart_link',
    'utm_campaign=offer_codes',
    ...(src ? [`utm_content=${src}`] : []),
  ].join('&');
  return `${GOOGLE_PLAY_URL}&referrer=${encodeURIComponent(referrer)}`;
}

// Shared by /download (promo via ?promo= query) and pretty campaign
// routes like /kazka (promo forced via prop, own OG card for messengers).
export default function DownloadClient({
  forcedPromo,
}: {
  forcedPromo?: string;
}) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [promoWord, setPromoWord] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('en');
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [manualFallback, setManualFallback] = useState(false);
  // One visit = one count, even if React re-mounts the effect in dev.
  const hitReported = useRef(false);

  useEffect(() => {
    const p = detectPlatform();
    const params = new URLSearchParams(window.location.search);
    const raw = forcedPromo ?? params.get('promo');
    const word = raw ? raw.trim().toUpperCase() : null;
    const promo = word && PROMOS[word] ? word : null;

    const placement = sanitizeSrc(params.get('src'));

    setPlatform(p);
    setPromoWord(promo);
    setSrc(placement);
    setLocale(detectLocale());

    // Fire before the iOS redirect below, so iPhone visits are counted too —
    // this is the only signal Apple's parameter-less redeem URL leaves us.
    if (promo && !hitReported.current) {
      hitReported.current = true;
      reportHit(promo, placement, p);
    }

    if (p === 'ios') {
      window.location.href = promo
        ? appleRedeemUrl(PROMOS[promo].ios)
        : APP_STORE_URL;
    } else if (p === 'android' && !promo) {
      window.location.href = GOOGLE_PLAY_URL;
    }
    // Android with a promo: no redirect — the user must see the offer
    // before leaving for the Play redeem flow.
  }, [forcedPromo]);

  const promo = promoWord ? PROMOS[promoWord] : null;
  const t = STRINGS[locale];

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

  // One-tap Android activation: claim a one-time code, then deep-link into
  // the Play redeem flow with the code prefilled. Any failure (empty pool,
  // network, function down) falls back to the manual custom-code steps.
  const claimAndRedeem = async () => {
    if (!promoWord || claiming) return;
    setClaiming(true);
    try {
      const response = await fetch(PROMO_CLAIM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: promoWord.toLowerCase(), src }),
      });
      if (!response.ok) throw new Error(`claim-failed-${response.status}`);
      const data: { code?: string } = await response.json();
      if (!data.code) throw new Error('claim-empty');
      window.location.href = `https://play.google.com/redeem?code=${encodeURIComponent(data.code)}`;
    } catch {
      setManualFallback(true);
      setClaiming(false);
    }
  };

  const codeCard = promo ? (
    <div className="rounded-2xl border-2 border-dashed border-brand-gold bg-brand-gold/10 px-6 py-5 space-y-2">
      <div className="text-4xl font-extrabold tracking-[0.25em] text-brand-purple">
        {promo.android}
      </div>
      <button
        type="button"
        onClick={copyCode}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-purple hover:underline"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? t.copied : t.copy}
      </button>
    </div>
  ) : null;

  const benefitsList = (
    <ul className="space-y-2.5 text-left">
      {t.benefits.map((benefit, i) => (
        <li key={benefit} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-lg">
            {['🎨', '🌍', '🎧'][i]}
          </span>
          <span className="text-sm text-foreground/90">{benefit}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <header
        className="relative overflow-hidden px-4 pb-16 pt-12 text-center"
        style={{
          backgroundImage:
            'linear-gradient(180deg, var(--scene-night-top) 0%, var(--scene-night-bottom) 100%)',
        }}
      >
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className={`pointer-events-none absolute select-none text-brand-gold ${s.cls}`}
            style={{ top: s.top, left: s.left }}
          >
            ✦
          </span>
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192.png"
          alt="Storywell"
          className="mx-auto h-20 w-20 rounded-[22%] shadow-[0_0_48px_rgba(255,184,77,0.45)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/storywell-name.png"
          alt="Storywell"
          className="mx-auto mt-4 h-9 w-auto"
        />
        <p className="mt-3 text-sm text-white/80">{t.tagline}</p>
      </header>

      <main className="relative z-10 mx-auto -mt-8 w-full max-w-md px-4 pb-10">
        <div className="space-y-5 rounded-3xl bg-card p-6 text-center shadow-xl shadow-brand-purple/10 ring-1 ring-black/5">
          {promo &&
          platform === 'android' &&
          ANDROID_ONE_TAP_REDEEM &&
          !manualFallback ? (
            <>
              <div className="text-4xl" aria-hidden>
                🎁
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">
                  {t.giftTitle}
                </h1>
                <p className="text-magic-gradient text-2xl font-extrabold">
                  {t.giftSubtitle}
                </p>
              </div>

              {benefitsList}

              <button
                type="button"
                onClick={claimAndRedeem}
                disabled={claiming}
                className="bg-magic-gradient inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-pink/30 transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {claiming ? t.claiming : t.activate}
              </button>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {t.autorenew}
              </p>
            </>
          ) : promo ? (
            <>
              <div className="text-4xl" aria-hidden>
                🎁
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">
                  {t.giftTitle}
                </h1>
                <p className="text-magic-gradient text-2xl font-extrabold">
                  {t.giftSubtitle}
                </p>
                {manualFallback && (
                  <p className="pt-1 text-sm text-muted-foreground">
                    {t.fallbackNote}
                  </p>
                )}
              </div>

              {codeCard}

              {platform === 'android' ? (
                <>
                  <div className="space-y-2 text-left">
                    <p className="font-semibold text-foreground">
                      {t.stepsTitle}
                    </p>
                    <ol className="list-inside list-decimal space-y-1.5 text-sm text-muted-foreground">
                      {t.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <a
                    href={playPromoUrl(promoWord!, src)}
                    className="bg-magic-gradient inline-flex w-full items-center justify-center rounded-full px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-pink/30 transition-transform active:scale-[0.98]"
                  >
                    {t.install}
                  </a>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t.desktopHint}
                  </p>
                  <StoreBadges className="justify-center" />
                </>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                {t.autorenew}
              </p>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-foreground">
                  {t.downloadTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t.downloadSubtitle}
                </p>
              </div>

              {benefitsList}

              <StoreBadges className="justify-center" />
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {t.trust}
        </p>
      </main>
    </div>
  );
}

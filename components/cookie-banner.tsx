"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useParams } from "next/navigation";

const HEADING_ID = "cookie-consent-heading";

const linkClass =
  "text-primary hover:text-primary/80 underline font-semibold rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function CookieBanner() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setShowBanner(false);
    setShowPreferences(false);
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setShowBanner(false);
    setShowPreferences(false);
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleSavePreferences = (analytics: boolean, marketing: boolean) => {
    const preferences = {
      essential: true,
      analytics,
      marketing,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleClose = () => {
    // Closing without choosing is recorded as essential-only consent.
    handleRejectNonEssential();
  };

  if (!showBanner) return null;

  return (
    // The wrapper spans the viewport for positioning only; pointer-events are
    // re-enabled on the bar itself so the page underneath stays fully usable.
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none p-0 sm:p-4">
      <section
        role="region"
        aria-labelledby={HEADING_ID}
        className="pointer-events-auto relative mx-auto w-full max-w-4xl bg-card text-card-foreground border-t border-border shadow-2xl sm:rounded-xl sm:border sm:border-primary/30 pb-[env(safe-area-inset-bottom)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300"
      >
        <button
          onClick={handleClose}
          className="absolute top-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {!showPreferences ? (
          <div className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="hidden sm:flex h-9 w-9 shrink-0 bg-primary/10 rounded-full items-center justify-center">
                  <Cookie className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>

                <div className="min-w-0 max-h-[32vh] overflow-y-auto pr-8 sm:pr-6 lg:max-h-none lg:overflow-visible lg:pr-0">
                  <h2 id={HEADING_ID} className="text-base font-bold text-foreground">
                    {t.cookieTitle}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground leading-snug">
                    {t.cookieDescription}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.cookieReadMore}{" "}
                    <Link href={`/${locale}/privacy`} className={linkClass}>
                      {t.cookiePrivacyPolicy}
                    </Link>
                    {", "}
                    <Link href={`/${locale}/terms`} className={linkClass}>
                      {t.cookieTerms}
                    </Link>
                    {" & "}
                    <Link href={`/${locale}/impressum`} className={linkClass}>
                      {t.footerImpressum}
                    </Link>{" "}
                    {t.cookieLearnMore}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap lg:items-center">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-magic-gradient hover:opacity-90 h-11 lg:h-9 flex-1 min-w-[8.5rem] lg:flex-none"
                >
                  {t.cookieAcceptAll}
                </Button>
                <Button
                  onClick={handleRejectNonEssential}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-accent h-11 lg:h-9 flex-1 min-w-[8.5rem] lg:flex-none"
                >
                  {t.cookieOnlyEssential}
                </Button>
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary h-11 lg:h-9 w-full lg:w-auto"
                >
                  {t.cookiePreferences}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <PreferencesPanel
            headingId={HEADING_ID}
            onSave={handleSavePreferences}
            onBack={() => setShowPreferences(false)}
          />
        )}
      </section>
    </div>
  );
}

function PreferencesPanel({
  headingId,
  onSave,
  onBack,
}: {
  headingId: string;
  onSave: (analytics: boolean, marketing: boolean) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="max-h-[80vh] overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
      <h2 id={headingId} className="text-lg font-bold text-foreground mb-2 pr-8">
        {t.cookiePreferencesTitle}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        {t.cookiePreferencesDesc}
      </p>

      <div className="space-y-3 mb-5">
        <div className="flex items-start justify-between gap-3 p-3 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">
                <label htmlFor="cookie-essential">{t.cookieEssentialTitle}</label>
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{t.cookieEssentialRequired}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.cookieEssentialDesc}
            </p>
          </div>
          <input
            id="cookie-essential"
            type="checkbox"
            checked
            disabled
            readOnly
            className="mt-1 h-5 w-5 shrink-0 accent-primary rounded cursor-not-allowed opacity-50"
          />
        </div>

        <div className="flex items-start justify-between gap-3 p-3 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              <label htmlFor="cookie-analytics">{t.cookieAnalyticsTitle}</label>
            </h3>
            <p className="text-sm text-muted-foreground">
              {t.cookieAnalyticsDesc}
            </p>
          </div>
          <input
            id="cookie-analytics"
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="flex items-start justify-between gap-3 p-3 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              <label htmlFor="cookie-marketing">{t.cookieMarketingTitle}</label>
            </h3>
            <p className="text-sm text-muted-foreground">
              {t.cookieMarketingDesc}
            </p>
          </div>
          <input
            id="cookie-marketing"
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            disabled
            className="mt-1 h-5 w-5 shrink-0 accent-primary rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => onSave(analytics, marketing)}
          className="bg-magic-gradient hover:opacity-90 flex-1"
        >
          {t.cookieSavePreferences}
        </Button>
        <Button onClick={onBack} variant="outline" className="border-2 border-border flex-1">
          {t.cookieBack}
        </Button>
      </div>
    </div>
  );
}

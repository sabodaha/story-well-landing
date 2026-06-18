"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useParams } from "next/navigation";

export function CookieBanner() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setShowBanner(false);
    setShowPreferences(false);
    // Trigger event for GA to reload
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setShowBanner(false);
    setShowPreferences(false);
    // Trigger event for GA to reload
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
    // Trigger event for GA to reload
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleClose = () => {
    // Treat closing as "essential only"
    handleRejectNonEssential();
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
        <Card className="max-w-5xl mx-auto border-2 border-primary/30 shadow-2xl">
          {!showPreferences ? (
            // Main Banner
            <div className="p-6 md:p-8">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Cookie className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t.cookieTitle}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t.cookieDescription}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.cookieReadMore}{" "}
                    <Link href={`/${locale}/privacy`} className="text-primary hover:text-primary/80 underline font-semibold">
                      {t.cookiePrivacyPolicy}
                    </Link>
                    {", "}
                    <Link href={`/${locale}/terms`} className="text-primary hover:text-primary/80 underline font-semibold">
                      {t.cookieTerms}
                    </Link>
                    {" & "}
                    <Link href={`/${locale}/impressum`} className="text-primary hover:text-primary/80 underline font-semibold">
                      {t.footerImpressum}
                    </Link>{" "}
                    {t.cookieLearnMore}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[200px]">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-magic-gradient hover:opacity-90 w-full"
                  >
                    {t.cookieAcceptAll}
                  </Button>
                  <Button
                    onClick={handleRejectNonEssential}
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-accent w-full"
                  >
                    {t.cookieOnlyEssential}
                  </Button>
                  <Button
                    onClick={() => setShowPreferences(true)}
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary w-full"
                  >
                    {t.cookiePreferences}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Preferences Panel
            <PreferencesPanel
              onSave={handleSavePreferences}
              onBack={() => setShowPreferences(false)}
            />
          )}
        </Card>
      </div>
    </>
  );
}

function PreferencesPanel({
  onSave,
  onBack,
}: {
  onSave: (analytics: boolean, marketing: boolean) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="p-6 md:p-8">
      <h3 className="text-xl font-bold text-foreground mb-4">{t.cookiePreferencesTitle}</h3>
      <p className="text-muted-foreground mb-6">
        {t.cookiePreferencesDesc}
      </p>

      <div className="space-y-6 mb-6">
        {/* Essential Cookies */}
        <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{t.cookieEssentialTitle}</h4>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{t.cookieEssentialRequired}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.cookieEssentialDesc}
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="h-5 w-5 accent-primary rounded cursor-not-allowed opacity-50"
            />
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">{t.cookieAnalyticsTitle}</h4>
            <p className="text-sm text-muted-foreground">
              {t.cookieAnalyticsDesc}
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-5 w-5 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Marketing Cookies */}
        <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">{t.cookieMarketingTitle}</h4>
            <p className="text-sm text-muted-foreground">
              {t.cookieMarketingDesc}
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="h-5 w-5 accent-primary rounded cursor-pointer"
              disabled
            />
          </div>
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

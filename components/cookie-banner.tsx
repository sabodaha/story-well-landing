"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
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
        <Card className="max-w-5xl mx-auto border-2 border-purple-200 shadow-2xl">
          {!showPreferences ? (
            // Main Banner
            <div className="p-6 md:p-8">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Cookie className="h-6 w-6 text-purple-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🍪 We Value Your Privacy
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or 
                    choose to accept only essential cookies.
                  </p>
                  <p className="text-sm text-gray-500">
                    Read our{" "}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline font-semibold">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    to learn more.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[200px]">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={handleRejectNonEssential}
                    variant="outline"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 w-full"
                  >
                    Only Essential
                  </Button>
                  <Button
                    onClick={() => setShowPreferences(true)}
                    variant="ghost"
                    className="text-gray-600 hover:text-purple-600 w-full"
                  >
                    Preferences
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
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Cookie Preferences</h3>
      <p className="text-gray-600 mb-6">
        Manage your cookie preferences below. Essential cookies are always enabled as they are necessary for 
        the website to function properly.
      </p>

      <div className="space-y-6 mb-6">
        {/* Essential Cookies */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Required</span>
            </div>
            <p className="text-sm text-gray-600">
              These cookies are necessary for the website to function and cannot be disabled. They enable basic 
              features like page navigation and access to secure areas.
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="h-5 w-5 text-purple-600 rounded cursor-not-allowed opacity-50"
            />
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
            <p className="text-sm text-gray-600">
              These cookies help us understand how visitors interact with our website by collecting and reporting 
              information anonymously. This helps us improve our service.
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-5 w-5 text-purple-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Marketing Cookies */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
            <p className="text-sm text-gray-600">
              These cookies are used to track visitors across websites to display relevant and engaging advertisements. 
              We currently do not use marketing cookies.
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="h-5 w-5 text-purple-600 rounded cursor-pointer"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => onSave(analytics, marketing)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
        >
          Save Preferences
        </Button>
        <Button onClick={onBack} variant="outline" className="border-2 border-gray-300 flex-1">
          Back
        </Button>
      </div>
    </div>
  );
}


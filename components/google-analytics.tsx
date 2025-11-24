"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has consented to analytics cookies
    const checkConsent = () => {
      const consent = localStorage.getItem("cookie-consent");
      
      if (!consent) {
        setHasConsent(false);
        return;
      }

      // Check if user accepted all cookies or specifically analytics
      if (consent === "all") {
        setHasConsent(true);
      } else if (consent !== "essential") {
        try {
          const preferences = JSON.parse(consent);
          setHasConsent(preferences.analytics === true);
        } catch {
          setHasConsent(false);
        }
      }
    };

    checkConsent();

    // Listen for storage changes (when user updates cookie preferences)
    window.addEventListener("storage", checkConsent);
    
    // Custom event for when user changes cookies in the same tab
    window.addEventListener("cookieConsentChanged", checkConsent);

    return () => {
      window.removeEventListener("storage", checkConsent);
      window.removeEventListener("cookieConsentChanged", checkConsent);
    };
  }, []);

  // Don't load GA if user hasn't consented
  if (!hasConsent) {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      
      {/* Google Analytics configuration with privacy-friendly settings */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Configure GA4 with minimal data collection
          gtag('config', '${GA_MEASUREMENT_ID}', {
            // Anonymize IP (enabled by default in GA4, but explicitly setting it)
            anonymize_ip: true,
            
            // Disable advertising features
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            
            // Basic page view tracking only
            send_page_view: true,
            
            // Disable cross-device tracking
            client_storage: 'none',
            
            // Cookie settings (minimal storage)
            cookie_flags: 'SameSite=None;Secure',
            cookie_expires: 63072000, // 2 years (GA4 default)
            
            // Additional privacy settings
            restricted_data_processing: true
          });

          // Disable remarketing and advertising
          gtag('set', 'allow_ad_personalization_signals', false);
          
          // Log that GA is loaded with privacy mode
          console.log('Google Analytics loaded with privacy-friendly settings');
        `}
      </Script>
    </>
  );
}


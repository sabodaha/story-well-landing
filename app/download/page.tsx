'use client';

import { useEffect } from 'react';
import { detectPlatform } from '@/hooks/use-platform';
import { StoreBadges } from '@/components/store-badges';
import { BookOpen } from 'lucide-react';

const APP_STORE_URL = "https://apps.apple.com/app/id6759845142";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.dartim_media.storywell";

export default function DownloadPage() {
  useEffect(() => {
    const platform = detectPlatform();
    if (platform === 'ios') {
      window.location.href = APP_STORE_URL;
    } else if (platform === 'android') {
      window.location.href = GOOGLE_PLAY_URL;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-magic-gradient">
            Storywell
          </span>
        </div>

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
      </div>
    </div>
  );
}

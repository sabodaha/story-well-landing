'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SleepPlayer } from "@/components/sleep-player";
import { useTranslations } from "@/lib/i18n/use-translations";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export default function SleepPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || defaultLocale;
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="text-xl font-semibold text-purple-700 hover:text-purple-800"
          >
            Story Well
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/${locale}/stories/`}>{t.navStories}</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Link href={`/${locale}`}>{t.storiesBackHome}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SleepPlayer
          labels={{
            title: t.sleepTitle,
            subtitle: t.sleepSubtitle,
            chooseTrack: t.sleepChooseTrack,
            nowPlaying: t.sleepNowPlaying,
            audioMissing: t.sleepAudioMissing,
            timerLabel: t.sleepTimerLabel,
            timerOff: t.sleepTimerOff,
            timerSet: t.sleepTimerSet,
            timerCancel: t.sleepTimerCancel,
          }}
        />
      </main>
    </div>
  );
}


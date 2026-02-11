'use client';

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryCardGrid } from "@/components/story-card-grid";
import { StoryReader } from "@/components/story-reader";
import { fetchPublishedStories } from "@/lib/firebase/stories";
import type { Story } from "@/lib/types/story";
import { useTranslations } from "@/lib/i18n/use-translations";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

const resolveLocalizedText = (value: Record<string, string> | undefined, locale: Locale) => {
  if (!value) return "";
  return value[locale] || value.en || Object.values(value)[0] || "";
};

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50"><p className="text-gray-500">Loading...</p></div>}>
      <StoriesPageContent />
    </Suspense>
  );
}

function StoriesPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = (params?.locale as Locale) || defaultLocale;

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storyId = searchParams.get("id");
  const readMode = searchParams.get("read") === "1";
  const selectedStory = useMemo(
    () => stories.find((story) => story.id === storyId) || null,
    [stories, storyId]
  );
  const isPremiumStory = selectedStory?.isPremium ?? false;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchPublishedStories()
      .then((data) => {
        if (!active) return;
        setStories(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : t.storiesError);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t.storiesError]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = "Story Well";
    const storyTitle = selectedStory ? resolveLocalizedText(selectedStory.title, locale) : t.storiesTitle;
    document.title = storyTitle ? `${storyTitle} | ${baseTitle}` : baseTitle;

    const description = selectedStory
      ? resolveLocalizedText(selectedStory.summary, locale)
      : t.storiesSubtitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) {
      meta.setAttribute("content", description);
    }
  }, [selectedStory, locale, t.storiesTitle, t.storiesSubtitle]);

  const goToStory = (id: string) => {
    const p = new URLSearchParams();
    p.set("id", id);
    router.push(`/${locale}/stories/?${p.toString()}`);
  };

  const goToReader = (id: string) => {
    const p = new URLSearchParams();
    p.set("id", id);
    p.set("read", "1");
    router.push(`/${locale}/stories/?${p.toString()}`);
  };

  const clearSelection = () => {
    router.push(`/${locale}/stories/`);
  };

  const exitReader = () => {
    if (!selectedStory) return;
    const p = new URLSearchParams();
    p.set("id", selectedStory.id);
    router.push(`/${locale}/stories/?${p.toString()}`);
  };

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    fetchPublishedStories()
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t.storiesError);
        setLoading(false);
      });
  };

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
            <Button variant="outline" onClick={clearSelection}>
              {t.storiesBrowse}
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Link href={`/${locale}/sleep`}>{t.navSleep}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-6">
          {selectedStory ? (
            readMode && !isPremiumStory ? (
              <StoryReader
                storyId={selectedStory.id}
                locale={locale}
                onExit={exitReader}
                labels={{
                  loading: t.storyReaderLoading,
                  error: t.storyReaderError,
                  retry: t.storyReaderRetry,
                  back: t.storyReaderBack,
                  pageLabel: t.storyReaderPageLabel,
                  audioLabel: t.storyReaderAudioLabel,
                  noAudio: t.storyReaderNoAudio,
                  play: t.storyReaderPlay,
                  pause: t.storyReaderPause,
                  next: t.storyReaderNext,
                  prev: t.storyReaderPrev,
                  fullscreenEnter: t.storyReaderFullscreenEnter,
                  fullscreenExit: t.storyReaderFullscreenExit,
                  languageLabel: t.storyReaderLanguageLabel,
                }}
              />
            ) : (
              <Card className="border-purple-100 shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {resolveLocalizedText(selectedStory.title, locale)}
                    </h2>
                    {selectedStory.author ? (
                      <p className="text-sm text-gray-500">
                        {t.storiesByAuthor} {selectedStory.author}
                      </p>
                    ) : null}
                  </div>
                  {selectedStory.summary && (
                    <p className="text-gray-700">
                      {resolveLocalizedText(selectedStory.summary, locale)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => goToReader(selectedStory.id)}
                      disabled={isPremiumStory}
                    >
                      {t.storiesReadNow}
                    </Button>
                    <Button variant="outline" onClick={clearSelection}>
                      {t.storiesBackToList}
                    </Button>
                  </div>
                  {isPremiumStory ? (
                    <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 text-sm text-purple-700">
                      {t.storiesPremiumNotice}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="border-purple-100">
              <CardContent className="p-6 text-gray-600">{t.storiesSelectPrompt}</CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.storiesTitle}</h1>
            <p className="mt-2 text-gray-600">{t.storiesSubtitle}</p>
          </div>

          {loading ? (
            <Card className="border-purple-100">
              <CardContent className="p-6 text-gray-600">{t.storiesLoading}</CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <span className="text-red-600">{error}</span>
                <Button variant="outline" onClick={retryLoad}>
                  {t.storiesRetry}
                </Button>
              </CardContent>
            </Card>
          ) : stories.length === 0 ? (
            <Card className="border-purple-100">
              <CardContent className="p-6 text-gray-600">{t.storiesEmpty}</CardContent>
            </Card>
          ) : (
            <StoryCardGrid
              stories={stories}
              locale={locale}
              selectedStoryId={storyId}
              onSelect={goToStory}
              premiumLabel={t.storiesPremiumBadge}
            />
          )}
        </section>
      </main>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

/**
 * Pick the most recently updated free story.
 * Falls back to the first non-premium story if none have lastUpdatedAt.
 */
const pickDefaultStory = (stories: Story[]): Story | null => {
  const freeStories = stories.filter((s) => !s.isPremium);
  if (freeStories.length === 0) return null;

  // Sort by lastUpdatedAt descending; nulls go last
  const sorted = [...freeStories].sort((a, b) => {
    const aTime = a.lastUpdatedAt?.getTime() ?? 0;
    const bTime = b.lastUpdatedAt?.getTime() ?? 0;
    return bTime - aTime;
  });
  return sorted[0];
};

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5"><p className="text-muted-foreground">Loading...</p></div>}>
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

  const readerRef = useRef<HTMLDivElement>(null);

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The active story id — from URL or auto-selected
  const storyIdFromUrl = searchParams.get("id");
  const [activeStoryId, setActiveStoryId] = useState<string | null>(storyIdFromUrl);

  // Resolve the active story object
  const activeStory = useMemo(
    () => stories.find((s) => s.id === activeStoryId) ?? null,
    [stories, activeStoryId]
  );

  // ---- Fetch stories --------------------------------------------------------
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

  // ---- Auto-select default story after load ---------------------------------
  useEffect(() => {
    if (stories.length === 0) return;

    // If URL has ?id=xxx and it matches a loaded story, use that
    if (storyIdFromUrl && stories.some((s) => s.id === storyIdFromUrl)) {
      setActiveStoryId(storyIdFromUrl);
      return;
    }

    // Otherwise pick the most recently updated free story
    const defaultStory = pickDefaultStory(stories);
    if (defaultStory) {
      setActiveStoryId(defaultStory.id);
    }
  }, [stories, storyIdFromUrl]);

  // ---- Document title -------------------------------------------------------
  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = "Storywell";
    const storyTitle = activeStory ? resolveLocalizedText(activeStory.title, locale) : t.storiesTitle;
    document.title = storyTitle ? `${storyTitle} | ${baseTitle}` : baseTitle;
  }, [activeStory, locale, t.storiesTitle]);

  // ---- Select a story from the grid -----------------------------------------
  const selectStory = (id: string) => {
    const story = stories.find((s) => s.id === id);
    if (!story) return;

    // If premium, don't open in reader
    if (story.isPremium) {
      setActiveStoryId(id);
      // Still scroll up so user sees the premium notice
      readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setActiveStoryId(id);

    // Update URL so the story is shareable
    const p = new URLSearchParams();
    p.set("id", id);
    router.replace(`/${locale}/stories/?${p.toString()}`, { scroll: false });

    // Scroll to the reader at the top
    readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // ---- Determine what the reader shows --------------------------------------
  const isPremiumActive = activeStory?.isPremium ?? false;
  const showReader = activeStory && !isPremiumActive;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5">
      <header className="border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="text-xl font-semibold text-primary hover:text-primary"
          >
            Storywell
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild className="bg-magic-gradient">
              <Link href={`/${locale}/sleep`}>{t.navSleep}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Reader at the top */}
        <section ref={readerRef} className="scroll-mt-20">
          {loading ? (
            <Card className="border-border">
              <CardContent className="p-6 text-muted-foreground">{t.storiesLoading}</CardContent>
            </Card>
          ) : showReader ? (
            <div className="rounded-3xl shadow-2xl overflow-hidden border-4 border-primary/40">
              <StoryReader
                storyId={activeStory.id}
                locale={locale}
                onExit={() => {}}
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
            </div>
          ) : isPremiumActive && activeStory ? (
            <Card className="border-border shadow-lg">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {resolveLocalizedText(activeStory.title, locale)}
                </h2>
                <div className="rounded-lg border border-border bg-primary/5 p-4 text-sm text-primary">
                  {t.storiesPremiumNotice}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Currently reading label */}
          {activeStory && !loading && (
            <div className="mt-3 text-center">
              <span className="text-sm text-muted-foreground">
                {resolveLocalizedText(activeStory.title, locale)}
                {activeStory.author ? ` · ${activeStory.author}` : ""}
              </span>
            </div>
          )}
        </section>

        {/* Story tiles grid */}
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.storiesTitle}</h1>
            <p className="mt-2 text-muted-foreground">{t.storiesSubtitle}</p>
          </div>

          {loading ? (
            <Card className="border-border">
              <CardContent className="p-6 text-muted-foreground">{t.storiesLoading}</CardContent>
            </Card>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <span className="text-destructive">{error}</span>
                <Button variant="outline" onClick={retryLoad}>
                  {t.storiesRetry}
                </Button>
              </CardContent>
            </Card>
          ) : stories.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-6 text-muted-foreground">{t.storiesEmpty}</CardContent>
            </Card>
          ) : (
            <StoryCardGrid
              stories={stories}
              locale={locale}
              selectedStoryId={activeStoryId}
              onSelect={selectStory}
              premiumLabel={t.storiesPremiumBadge}
            />
          )}
        </section>
      </main>
    </div>
  );
}

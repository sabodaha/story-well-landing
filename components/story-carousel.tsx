"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookHeart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchPublishedStories } from "@/lib/firebase/stories";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Locale } from "@/lib/i18n/config";
import type { LocalizedText, Story } from "@/lib/types/story";

const MAX_CARDS = 12;
const PLACEHOLDER_COUNT = 6;
const FADE = "2.5rem";

const resolveLocalizedText = (value: LocalizedText | undefined, locale: Locale) => {
  if (!value) return "";
  return value[locale] || value.en || Object.values(value)[0] || "";
};

const buildMask = (fadeStart: boolean, fadeEnd: boolean) => {
  if (!fadeStart && !fadeEnd) return undefined;
  const left = fadeStart ? `transparent 0, #000 ${FADE}` : "#000 0";
  const right = fadeEnd ? `#000 calc(100% - ${FADE}), transparent 100%` : "#000 100%";
  return `linear-gradient(to right, ${left}, ${right})`;
};

export const StoryCarousel = ({ className = "" }: { className?: string }) => {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as Locale) || "en";
  const headingId = useId();

  const [stories, setStories] = useState<Story[] | null>(null);
  const [failed, setFailed] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [fadeStart, setFadeStart] = useState(false);
  const [fadeEnd, setFadeEnd] = useState(false);
  // The edge mask would clip the focus ring of the scroller and of the cards.
  const [focusWithin, setFocusWithin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPublishedStories()
      .then((result) => {
        if (cancelled) return;
        // Free stories lead: they are the ones a visitor can open in the browser
        // reader right now. A premium card sends them to a notice they cannot act on.
        const withCovers = result.filter((story) => Boolean(story.coverImageUrl));
        const ordered = [
          ...withCovers.filter((story) => !story.isPremium),
          ...withCovers.filter((story) => story.isPremium),
        ];
        setStories(ordered.slice(0, MAX_CARDS));
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const syncFades = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setFadeStart(node.scrollLeft > 8);
    setFadeEnd(max > 8 && node.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    syncFades();
    const observer = new ResizeObserver(syncFades);
    observer.observe(node);

    return () => observer.disconnect();
  }, [syncFades, stories]);

  // The covers are an enhancement; the heading and the CTA are the conversion
  // path, so they render even when Firestore is unreachable.
  const hasCovers = !failed && (stories === null || stories.length > 0);
  const isLoading = stories === null;
  const mask = focusWithin ? undefined : buildMask(fadeStart, fadeEnd);
  const cardClasses =
    "group relative w-[168px] shrink-0 snap-start rounded-2xl sm:w-[192px]";

  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}
      aria-labelledby={headingId}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            {t.exploreStoriesBadge}
          </Badge>
          <h2 id={headingId} className="text-4xl md:text-5xl font-bold mb-4">
            {t.exploreStoriesTitle}{" "}
            <span className="text-magic-gradient">{t.exploreStoriesTitleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.exploreStoriesSubtitle}
          </p>
        </div>

        <div
          ref={scrollerRef}
          onScroll={syncFades}
          onFocus={() => setFocusWithin(true)}
          onBlur={() => setFocusWithin(false)}
          hidden={!hasCovers}
          role="region"
          aria-label={`${t.exploreStoriesTitle} ${t.exploreStoriesTitleHighlight}`}
          tabIndex={0}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-px-4 px-4 pt-3 pb-6 -mx-4 sm:gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
        >
          {isLoading
            ? Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
                <div key={index} className={cardClasses} aria-hidden="true">
                  <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                </div>
              ))
            : stories.map((story) => {
                const title = resolveLocalizedText(story.title, locale);

                return (
                  <Link
                    key={story.id}
                    href={`/${locale}/stories/?id=${encodeURIComponent(story.id)}`}
                    className={`${cardClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg motion-reduce:transition-none">
                      <Image
                        src={story.coverImageUrl}
                        alt={title || "Story cover"}
                        width={192}
                        height={256}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {story.isPremium ? (
                        <span className="absolute left-2 top-2 rounded-full bg-brand-gold px-2 py-0.5 text-[11px] font-semibold text-[#4A2E08]">
                          {t.storiesPremiumBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
                      {title}
                    </p>
                  </Link>
                );
              })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="bg-magic-gradient text-white hover:opacity-90 text-lg h-14 px-8"
          >
            <Link href={`/${locale}/stories/`}>
              <BookHeart className="mr-2 h-5 w-5" />
              {t.exploreStoriesCta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

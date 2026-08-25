'use client';

import { useState } from "react";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n/use-translations";
import { localeNames, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type StoreReview = {
  id: string;
  source: string;
  store: string;
  rating: number;
  title: string;
  author: string;
  version: string;
  text: string;
  lang: string;
  translations: Record<string, { title?: string; text: string }>;
};

const MAX_STARS = 5;

/**
 * The source language named in the READER's language: a German reader should see
 * "Übersetzt aus Englisch", not "Übersetzt aus English". Intl.DisplayNames knows
 * every one of our eight, so this needs no translation table of its own. It falls
 * back to the language's own name if the runtime lacks the data.
 */
const languageNameIn = (lang: string, locale: string) => {
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(lang);
    if (name && name !== lang) return name;
  } catch {
    // Intl.DisplayNames unavailable — fall through.
  }
  return localeNames[lang as Locale]?.native ?? lang;
};

export const ReviewCard = ({
  review,
  locale,
}: {
  review: StoreReview;
  locale: string;
}) => {
  const t = useTranslations();

  const translation =
    locale === review.lang ? undefined : review.translations?.[locale];
  const canTranslate = Boolean(translation?.text);

  const [showOriginal, setShowOriginal] = useState(false);
  const showingTranslation = canTranslate && !showOriginal;

  const bodyText = showingTranslation ? translation!.text : review.text;
  const bodyLang = showingTranslation ? locale : review.lang;

  // The title may be untranslated even when the body is: label each by its own language.
  const titleTranslated = showingTranslation && Boolean(translation?.title);
  const titleText = titleTranslated ? translation!.title! : review.title;
  const titleLang = titleTranslated ? locale : review.lang;

  const storeLabel =
    review.source.toLowerCase() === "googleplay"
      ? t.reviewsFromGooglePlay
      : t.reviewsFromAppStore;

  const stars = Array.from({ length: MAX_STARS }, (_, i) => i < review.rating);

  return (
    <Card className="h-full border-2 border-border shadow-lg">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-1">
          <span aria-hidden="true" className="flex items-center gap-1">
            {stars.map((filled, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  filled
                    ? "fill-brand-gold text-brand-gold"
                    : "text-muted-foreground/40"
                )}
              />
            ))}
          </span>
          <span className="sr-only">{`${review.rating} / ${MAX_STARS}`}</span>
        </div>

        {titleText ? (
          <h3
            lang={titleLang}
            className="text-lg font-bold break-words text-foreground"
          >
            {titleText}
          </h3>
        ) : null}

        <div aria-live="polite" className="flex-1">
          <blockquote className="relative">
            <Quote
              aria-hidden="true"
              className="mb-2 h-5 w-5 text-primary/40"
            />
            <p
              lang={bodyLang}
              className="font-reading text-base leading-relaxed break-words whitespace-pre-wrap text-foreground/80"
            >
              {bodyText}
            </p>
          </blockquote>
        </div>

        {canTranslate ? (
          <div className="flex flex-col items-start gap-1">
            {showingTranslation ? (
              <p className="text-xs text-muted-foreground">
                {t.reviewsTranslatedFrom.replace(
                  "{language}",
                  languageNameIn(review.lang, locale)
                )}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="rounded-md text-xs font-semibold text-primary underline underline-offset-4 outline-none hover:text-primary/80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {showingTranslation ? t.reviewsShowOriginal : t.reviewsShowTranslation}
            </button>
          </div>
        ) : null}

        <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-4 text-sm">
          <span className="font-semibold text-foreground">{review.author}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <span className="text-muted-foreground">{storeLabel}</span>
        </footer>
      </CardContent>
    </Card>
  );
};

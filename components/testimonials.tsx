'use client';

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n/use-translations";
import data from "@/lib/data/store-reviews.json";

const MAX_RATING = 5;

// The store field is a storefront country, not a language, so it only yields a
// language tag for storefronts whose reviews we tag — and only when the script
// agrees (a DE storefront review is often written in English).
const STORE_LANG: Record<string, string> = { UA: "uk" };
const CYRILLIC = /[Ѐ-ӿ]/;

const inferLang = (store: string, text: string): string | undefined => {
  const lang = STORE_LANG[store];
  if (!lang) return undefined;
  return CYRILLIC.test(text) ? lang : undefined;
};

export const Testimonials = ({ className = "" }: { className?: string }) => {
  const copy = useTranslations();
  const reviews = data.reviews;

  if (reviews.length === 0) return null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            {copy.reviewsBadge}
          </Badge>
          <h2 id="reviews-heading" className="text-4xl md:text-5xl font-bold mb-4">
            {copy.reviewsTitle}{" "}
            <span className="text-magic-gradient">{copy.reviewsTitleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.reviewsSubtitle}
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {reviews.map((review) => {
            const rating = Math.max(0, Math.min(MAX_RATING, Math.round(review.rating)));
            const titleLang = inferLang(review.store, review.title);
            const textLang = inferLang(review.store, review.text);
            const storeLabel =
              review.source === "appstore" ? copy.reviewsFromAppStore : copy.reviewsFromGooglePlay;

            return (
              <li key={`${review.source}-${review.id}`} className="flex">
                <Card className="w-full transition-colors hover:border-primary/40">
                  <figure className="flex h-full flex-col gap-4 px-6">
                    <p className="flex items-center gap-0.5">
                      {Array.from({ length: MAX_RATING }, (_, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className={
                            i < rating
                              ? "size-4 fill-brand-gold text-brand-gold"
                              : "size-4 fill-none text-muted-foreground/40"
                          }
                        />
                      ))}
                      {/* Numeric so it stays correct in every page locale — there is no
                          translated "N out of 5" string on the page. */}
                      <span className="sr-only">{`${rating}/${MAX_RATING}`}</span>
                    </p>

                    {review.title ? (
                      <h3 lang={titleLang} className="font-semibold text-lg leading-snug">
                        {review.title}
                      </h3>
                    ) : null}

                    <blockquote
                      lang={textLang}
                      className="text-muted-foreground whitespace-pre-line leading-relaxed"
                    >
                      {review.text}
                    </blockquote>

                    <figcaption className="mt-auto pt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{review.author}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{storeLabel}</span>
                    </figcaption>
                  </figure>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

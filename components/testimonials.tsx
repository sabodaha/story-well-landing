'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useParams } from "next/navigation";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { ReviewCard, type StoreReview } from "@/components/review-card";
import data from "@/lib/data/store-reviews.json";

/** Three, not four: an odd row composes better and implies there are more. */
const HOMEPAGE_COUNT = 3;

/**
 * Highest rated first, then the more substantial review. A one-line "Nice app"
 * is genuine but persuades nobody, so it belongs on the full list rather than in
 * the three the homepage spends its space on.
 */
const byPersuasiveness = (a: StoreReview, b: StoreReview) =>
  b.rating - a.rating || b.text.length - a.text.length;

export const Testimonials = ({ className = "" }: { className?: string }) => {
  const copy = useTranslations();
  const params = useParams();
  const raw = params?.locale;
  const locale: Locale = locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;

  // Through unknown: each review's `translations` literal differs (a Ukrainian
  // review has no "uk" key), so the inferred union does not structurally match.
  const reviews = data.reviews as unknown as StoreReview[];
  if (reviews.length === 0) return null;

  const featured = [...reviews].sort(byPersuasiveness).slice(0, HOMEPAGE_COUNT);
  const hasMore = reviews.length > featured.length;

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

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((review) => (
            <li key={`${review.source}-${review.id}`} className="flex">
              <ReviewCard review={review} locale={locale} />
            </li>
          ))}
        </ul>

        {hasMore ? (
          <div className="mt-12 flex justify-center">
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href={`/${locale}/reviews/`}>
                {copy.reviewsSeeAll}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

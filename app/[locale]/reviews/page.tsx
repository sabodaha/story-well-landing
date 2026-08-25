import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewCard, type StoreReview } from "@/components/review-card";
import { getTranslations } from "@/lib/i18n/server";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";
import storeReviews from "@/lib/data/store-reviews.json";

// Required for `output: 'export'` — without it this route is not emitted per locale.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const reviews = (storeReviews.reviews ?? []) as unknown as StoreReview[];

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = (
    locales.includes(localeParam as Locale) ? localeParam : defaultLocale
  ) as Locale;
  const t = getTranslations(locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="rounded-md text-xl font-semibold text-primary outline-none hover:text-primary/80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Storywell
          </Link>
        </div>
      </header>

      <main id="main-content" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              {t.reviewsBadge}
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {t.reviewsPageTitle}{" "}
              <span className="text-magic-gradient">{t.reviewsPageTitleHighlight}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t.reviewsPageSubtitle}
            </p>
          </div>

          {reviews.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-6 text-center text-muted-foreground">
                {t.reviewsEmpty}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} locale={locale} />
              ))}
            </div>
          )}

          <div className="mt-16 flex flex-col items-center gap-4">
            <Button asChild size="lg" className="bg-magic-gradient hover:opacity-90">
              <Link href={`/${locale}/feedback`}>{t.reviewsLeaveOwn}</Link>
            </Button>
            <Button asChild variant="ghost" className="gap-2">
              <Link href={`/${locale}`}>
                <ArrowLeft className="h-4 w-4" />
                {t.backToHome}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

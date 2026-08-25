'use client';

import Image from "next/image";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/use-translations";

const SHOT_WIDTH = 560;
const SHOT_HEIGHT = 1213;

const SHOTS = [
  { slug: "library", captionKey: "appShotLibrary" },
  { slug: "reader", captionKey: "appShotReader" },
  { slug: "sleep", captionKey: "appShotSleep" },
  { slug: "story", captionKey: "appShotStory" },
] as const;

export const AppScreenshots = ({ className = "" }: { className?: string }) => {
  const params = useParams();
  const rawLocale = params?.locale;
  const locale: Locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : "en";

  const copy = useTranslations();

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            {copy.appShotsBadge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {copy.appShotsTitle}{" "}
            <span className="text-magic-gradient">{copy.appShotsTitleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.appShotsSubtitle}
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-6 xl:gap-10">
          {SHOTS.map(({ slug, captionKey }, index) => {
            const caption = copy[captionKey];

            return (
              <li
                key={slug}
                className={`flex flex-col items-center ${index % 2 === 1 ? "lg:mt-10" : ""}`}
              >
                <div className="relative w-full max-w-[240px] rounded-[2rem] bg-[var(--scene-night-top)] p-2.5 pt-3.5 shadow-2xl shadow-brand-purple/20 ring-1 ring-white/15">
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25"
                  />
                  <div className="relative aspect-[560/1213] w-full overflow-hidden rounded-[1.5rem] bg-[var(--scene-night-bottom)]">
                    <Image
                      src={`/app/${slug}-${locale}.webp`}
                      alt={`${caption} — Storywell (${localeNames[locale].native})`}
                      width={SHOT_WIDTH}
                      height={SHOT_HEIGHT}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <p className="mt-5 max-w-[17rem] text-center text-sm text-balance text-muted-foreground">
                  {caption}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

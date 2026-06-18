import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Story } from "@/lib/types/story";
import type { Locale } from "@/lib/i18n/config";

const resolveLocalizedText = (value: Record<string, string> | undefined, locale: Locale) => {
  if (!value) return "";
  return value[locale] || value.en || Object.values(value)[0] || "";
};

type StoryCardGridProps = {
  stories: Story[];
  locale: Locale;
  selectedStoryId?: string | null;
  onSelect: (storyId: string) => void;
  premiumLabel?: string;
};

export const StoryCardGrid = ({
  stories,
  locale,
  selectedStoryId,
  onSelect,
  premiumLabel,
}: StoryCardGridProps) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => {
        const title = resolveLocalizedText(story.title, locale);
        const isSelected = selectedStoryId === story.id;

        return (
          <button
            key={story.id}
            type="button"
            onClick={() => onSelect(story.id)}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-3xl"
            aria-pressed={isSelected}
            aria-label={title || "Story"}
          >
            <Card
              className={`overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-primary shadow-lg"
                  : "border-border hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className="relative aspect-[4/3] w-full bg-muted">
                {story.coverImageUrl ? (
                  <Image
                    src={story.coverImageUrl}
                    alt={title || "Story cover"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <span className="text-4xl">📖</span>
                  </div>
                )}
                {story.isPremium && premiumLabel ? (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-gold px-3 py-1 text-xs font-semibold text-[#4A2E08]">
                    {premiumLabel}
                  </span>
                ) : null}
              </div>
              <CardContent className="space-y-2 p-4">
                <h3 className="text-lg font-semibold text-foreground line-clamp-2">{title}</h3>
                {story.author ? (
                  <p className="text-sm text-muted-foreground">{story.author}</p>
                ) : (
                  <div className="h-4" />
                )}
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
};

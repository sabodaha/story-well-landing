export type LocalizedText = Record<string, string>;

export interface Story {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  author: string;
  coverImageUrl: string;
  createdAt?: Date | null;
  lastUpdatedAt?: Date | null;
  isPublished: boolean;
  isPremium: boolean;
  /** "story" | "series_episode" | "audiobook", absent on older documents. */
  contentType: string;
}

export interface StoryPage {
  index: number;
  imageUrl: string;
  caption: LocalizedText;
  audioUrls?: LocalizedText;
}










import {
  Timestamp,
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  getFirestore,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { runProjectedGet, runProjectedQuery } from "./rest";
import type { LocalizedText, Story, StoryPage } from "@/lib/types/story";

const db = getFirestore(getFirebaseApp());

const STORY_FIELD_PATHS = [
  "title",
  "summary",
  "author",
  "coverImageUrl",
  "createdAt",
  "lastUpdatedAt",
  "isPublished",
  "isPremium",
  "contentType",
];

// The page documents also carry per-locale alignment data that this site never
// reads; projecting to these four fields keeps the payload at a fraction of it.
const PAGE_FIELD_PATHS = ["index", "imageUrl", "caption", "audioUrls"];

const selectMask = (fieldPaths: string[]) => ({
  fields: fieldPaths.map((fieldPath) => ({ fieldPath })),
});

const errorMessage = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const normalizeLocalizedText = (value: unknown): LocalizedText => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: LocalizedText = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry == null) continue;
    result[String(key)] = typeof entry === "string" ? entry : String(entry);
  }
  return result;
};

const normalizeDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value !== null) {
    const seconds = (value as { seconds?: number }).seconds;
    const nanos = (value as { nanoseconds?: number }).nanoseconds;
    if (typeof seconds === "number") {
      const millis = seconds * 1000 + (typeof nanos === "number" ? Math.floor(nanos / 1e6) : 0);
      const parsed = new Date(millis);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  return null;
};

const mapStory = (id: string, data: Record<string, unknown>): Story => ({
  id,
  title: normalizeLocalizedText(data.title),
  summary: normalizeLocalizedText(data.summary),
  author: typeof data.author === "string" ? data.author : "",
  coverImageUrl: typeof data.coverImageUrl === "string" ? data.coverImageUrl : "",
  createdAt: normalizeDate(data.createdAt),
  lastUpdatedAt: normalizeDate(data.lastUpdatedAt),
  isPublished: Boolean(data.isPublished ?? true),
  isPremium: Boolean(data.isPremium ?? false),
  contentType: typeof data.contentType === "string" ? data.contentType : "",
});

const mapStoryPage = (data: Record<string, unknown>): StoryPage => ({
  index: typeof data.index === "number" ? data.index : 0,
  imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
  caption: normalizeLocalizedText(data.caption),
  audioUrls: normalizeLocalizedText(data.audioUrls),
});

const publishedStoriesQuery = () =>
  query(collection(db, "stories"), where("isPublished", "==", true), orderBy("createdAt", "desc"));

const pagesQuery = (storyId: string) =>
  query(collection(db, "stories", storyId, "pages"), orderBy("index", "asc"));

// The carousel and the stats card both want this list. One request per page load
// is enough; a rejected attempt is dropped so a later caller can retry.
let publishedStoriesPromise: Promise<Story[]> | null = null;

export const fetchPublishedStories = (): Promise<Story[]> => {
  if (!publishedStoriesPromise) {
    publishedStoriesPromise = loadPublishedStories().catch((error) => {
      publishedStoriesPromise = null;
      throw error;
    });
  }
  return publishedStoriesPromise;
};

const loadPublishedStories = async (): Promise<Story[]> => {
  let restMessage: string;
  try {
    const documents = await runProjectedQuery([], {
      from: [{ collectionId: "stories" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "isPublished" },
          op: "EQUAL",
          value: { booleanValue: true },
        },
      },
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
      select: selectMask(STORY_FIELD_PATHS),
    });
    return documents.map((entry) => mapStory(entry.id, entry.data));
  } catch (error) {
    restMessage = errorMessage(error);
  }

  try {
    // getDocsFromServer rather than getDocs: the cached read resolves empty
    // instead of rejecting when the connection is down.
    const snapshot = await getDocsFromServer(publishedStoriesQuery());
    return snapshot.docs.map((docSnap) => mapStory(docSnap.id, docSnap.data()));
  } catch (error) {
    throw new Error(
      `[Firestore] Failed to fetch published stories: ${restMessage} (SDK fallback: ${errorMessage(error)})`
    );
  }
};

export const fetchStoryById = async (storyId: string): Promise<Story | null> => {
  let restMessage: string;
  try {
    const document = await runProjectedGet(["stories", storyId], STORY_FIELD_PATHS);
    return document ? mapStory(document.id, document.data) : null;
  } catch (error) {
    restMessage = errorMessage(error);
  }

  try {
    // getDocFromServer rather than getDoc: the cached read reports a missing
    // document when the connection is down, which reads as "story not found".
    const snapshot = await getDocFromServer(doc(db, "stories", storyId));
    if (!snapshot.exists()) return null;
    return mapStory(snapshot.id, snapshot.data());
  } catch (error) {
    throw new Error(
      `[Firestore] Failed to fetch story "${storyId}": ${restMessage} (SDK fallback: ${errorMessage(error)})`
    );
  }
};

const loadPages = async (storyId: string): Promise<StoryPage[]> => {
  let restMessage: string;
  try {
    const documents = await runProjectedQuery(["stories", storyId], {
      from: [{ collectionId: "pages" }],
      orderBy: [{ field: { fieldPath: "index" }, direction: "ASCENDING" }],
      select: selectMask(PAGE_FIELD_PATHS),
    });
    return documents.map((entry) => mapStoryPage(entry.data));
  } catch (error) {
    restMessage = errorMessage(error);
  }

  try {
    const snapshot = await getDocsFromServer(pagesQuery(storyId));
    return snapshot.docs.map((docSnap) => mapStoryPage(docSnap.data()));
  } catch (error) {
    throw new Error(
      `[Firestore] Failed to fetch pages at stories/${storyId}/pages: ${restMessage} (SDK fallback: ${errorMessage(error)})`
    );
  }
};

export const fetchPagesForStory = async (storyId: string): Promise<StoryPage[]> => {
  const pages = await loadPages(storyId);
  if (pages.length === 0) {
    console.warn(`[Firestore] No pages found at stories/${storyId}/pages`);
  }
  return pages;
};

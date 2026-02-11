import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import type { LocalizedText, Story, StoryPage } from "@/lib/types/story";

const db = getFirestore(getFirebaseApp());

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
});

const mapStoryPage = (data: Record<string, unknown>): StoryPage => ({
  index: typeof data.index === "number" ? data.index : 0,
  imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
  caption: normalizeLocalizedText(data.caption),
  audioUrls: normalizeLocalizedText(data.audioUrls),
});

export const fetchPublishedStories = async (): Promise<Story[]> => {
  try {
    const storiesQuery = query(
      collection(db, "stories"),
      where("isPublished", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(storiesQuery);
    return snapshot.docs.map((docSnap) => mapStory(docSnap.id, docSnap.data()));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[Firestore] Failed to fetch published stories: ${message}`);
  }
};

export const fetchStoryById = async (storyId: string): Promise<Story | null> => {
  try {
    const storyRef = doc(db, "stories", storyId);
    const snapshot = await getDoc(storyRef);
    if (!snapshot.exists()) return null;
    return mapStory(snapshot.id, snapshot.data());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[Firestore] Failed to fetch story "${storyId}": ${message}`);
  }
};

export const fetchPagesForStory = async (storyId: string): Promise<StoryPage[]> => {
  try {
    const pagesQuery = query(
      collection(db, "stories", storyId, "pages"),
      orderBy("index", "asc")
    );
    const snapshot = await getDocs(pagesQuery);
    if (snapshot.empty) {
      console.warn(`[Firestore] No pages found at stories/${storyId}/pages`);
    }
    return snapshot.docs.map((docSnap) => mapStoryPage(docSnap.data()));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[Firestore] Failed to fetch pages at stories/${storyId}/pages: ${message}`);
  }
};



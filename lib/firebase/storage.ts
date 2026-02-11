'use client';

import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./client";

const storage = getStorage(getFirebaseApp());

// In-memory cache for download URLs (avoids repeated API calls)
const urlCache = new Map<string, string>();
const failedPaths = new Set<string>();

/**
 * Get a Firebase Storage download URL for a given storage path.
 * Returns a token-bearing URL (firebasestorage.googleapis.com) that is
 * authenticated via Firebase Storage rules instead of public GCS access.
 *
 * Results are cached in memory for the session.
 */
export async function getStorageDownloadUrl(storagePath: string): Promise<string | null> {
  if (!storagePath) return null;

  // Already cached
  const cached = urlCache.get(storagePath);
  if (cached) return cached;

  // Known to not exist – skip
  if (failedPaths.has(storagePath)) return null;

  try {
    const fileRef = ref(storage, storagePath);
    const url = await getDownloadURL(fileRef);
    urlCache.set(storagePath, url);
    return url;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    // storage/object-not-found → don't retry
    if (code === "storage/object-not-found") {
      failedPaths.add(storagePath);
    }
    console.warn(`[storage] getDownloadURL failed for "${storagePath}":`, (err as Error).message || err);
    return null;
  }
}

/**
 * Resolve an audio URL for a story page.
 *
 * Priority:
 * 1. If `audioUrls[locale]` is already an HTTPS URL → use directly.
 * 2. Otherwise try Firebase Storage SDK `getDownloadURL` with the well-known
 *    path pattern: `stories/{storyId}/audio/{locale}/page_{index}.mp3`
 *
 * This avoids constructing raw `storage.googleapis.com` URLs, which are only
 * accessible when the GCS bucket has `allUsers` read access.
 */
export async function resolveAudioDownloadUrl(
  audioUrls: Record<string, string> | undefined,
  locale: string,
  storyId: string,
  pageIndex: number
): Promise<string> {
  const stored = audioUrls?.[locale] || "";

  // Already a full HTTP URL – use as-is
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return stored;
  }

  // Try the well-known storage path via Firebase SDK
  const storagePath = `stories/${storyId}/audio/${locale}/page_${pageIndex}.mp3`;
  const downloadUrl = await getStorageDownloadUrl(storagePath);
  return downloadUrl || "";
}

/**
 * Batch-resolve audio download URLs for all pages in a given locale.
 * Returns a map of pageIndex → download URL string.
 */
export async function resolveAllAudioUrls(
  pages: Array<{ index: number; audioUrls?: Record<string, string> }>,
  locale: string,
  storyId: string
): Promise<Map<number, string>> {
  const result = new Map<number, string>();

  const promises = pages.map(async (page) => {
    const url = await resolveAudioDownloadUrl(page.audioUrls, locale, storyId, page.index);
    result.set(page.index, url);
  });

  await Promise.all(promises);
  return result;
}


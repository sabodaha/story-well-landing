'use client';

import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./client";

const storage = getStorage(getFirebaseApp());

// In-memory cache for download URLs (avoids repeated API calls)
const urlCache = new Map<string, string>();
const failedPaths = new Set<string>();

// Bucket name used by the project (for parsing GCS URLs)
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kidsstoriesapp.firebasestorage.app";

/**
 * Extract the Firebase Storage path from a `storage.googleapis.com` URL.
 *
 * Example:
 *   Input:  https://storage.googleapis.com/kidsstoriesapp.firebasestorage.app/stories/X/audio/en/page_1.mp3
 *   Output: stories/X/audio/en/page_1.mp3
 *
 * Returns null if the URL isn't a GCS URL for our bucket.
 */
function extractPathFromGcsUrl(url: string): string | null {
  const prefix = `https://storage.googleapis.com/${BUCKET}/`;
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length);
  }
  return null;
}

/**
 * Check if a URL is already a Firebase download URL (firebasestorage.googleapis.com)
 * with a token – these work as-is.
 */
function isFirebaseDownloadUrl(url: string): boolean {
  return url.includes("firebasestorage.googleapis.com") && url.includes("alt=media");
}

/**
 * Get a Firebase Storage download URL for a given storage path.
 * Returns a token-bearing URL (firebasestorage.googleapis.com) that works
 * regardless of public GCS access settings.
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
 * 1. If `audioUrls[locale]` is a Firebase download URL (with token) → use directly.
 * 2. If it's a `storage.googleapis.com` URL → extract the path and call
 *    `getDownloadURL()` to get a token-bearing URL that actually works.
 * 3. If it's some other HTTP URL → use directly (external host).
 * 4. If no URL in Firestore → try the well-known Storage path:
 *    `stories/{storyId}/audio/{locale}/page_{index+1}.mp3`
 *    (Pages in Storage are 1-indexed: page_1.mp3, page_2.mp3, etc.)
 */
export async function resolveAudioDownloadUrl(
  audioUrls: Record<string, string> | undefined,
  locale: string,
  storyId: string,
  pageIndex: number
): Promise<string> {
  const stored = audioUrls?.[locale] || "";

  // --- Case 1: Already a Firebase download URL (has token) ---
  if (stored && isFirebaseDownloadUrl(stored)) {
    return stored;
  }

  // --- Case 2: GCS public URL → convert to Firebase download URL ---
  if (stored) {
    const gcsPath = extractPathFromGcsUrl(stored);
    if (gcsPath) {
      const downloadUrl = await getStorageDownloadUrl(gcsPath);
      if (downloadUrl) return downloadUrl;
      // Fall through to other fallbacks if getDownloadURL failed
    }
  }

  // --- Case 3: Other HTTP URL (e.g. external CDN) → use as-is ---
  if (stored && (stored.startsWith("http://") || stored.startsWith("https://"))) {
    return stored;
  }

  // --- Case 4: No URL or non-HTTP path → try the well-known storage path ---
  // Files in storage are 1-indexed: page_1.mp3 corresponds to Firestore page index 0
  const fileIndex = pageIndex + 1;
  const fallbackPath = `stories/${storyId}/audio/${locale}/page_${fileIndex}.mp3`;
  const downloadUrl = await getStorageDownloadUrl(fallbackPath);
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

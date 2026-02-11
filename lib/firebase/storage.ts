'use client';

import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./client";

const storage = getStorage(getFirebaseApp());

// In-memory cache for download URLs (avoids repeated API calls)
const urlCache = new Map<string, string>();
const failedPaths = new Set<string>();

// Bucket name used by the project (for parsing GCS URLs)
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kidsstoriesapp.firebasestorage.app";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutHandle = setTimeout(() => resolve(null), ms);
    });
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

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
  try {
    if (url.startsWith("gs://")) {
      const withoutScheme = url.slice("gs://".length);
      if (!withoutScheme.startsWith(`${BUCKET}/`)) return null;
      return withoutScheme.slice(BUCKET.length + 1);
    }

    const parsed = new URL(url);

    // https://storage.googleapis.com/{bucket}/{path}
    if (parsed.hostname === "storage.googleapis.com") {
      const directPrefix = `/${BUCKET}/`;
      if (parsed.pathname.startsWith(directPrefix)) {
        return decodeURIComponent(parsed.pathname.slice(directPrefix.length));
      }

      // https://storage.googleapis.com/download/storage/v1/b/{bucket}/o/{path}?alt=media
      const apiPrefix = `/download/storage/v1/b/${BUCKET}/o/`;
      if (parsed.pathname.startsWith(apiPrefix)) {
        return decodeURIComponent(parsed.pathname.slice(apiPrefix.length));
      }
    }

    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token=...
    if (parsed.hostname === "firebasestorage.googleapis.com") {
      const firebasePrefix = `/v0/b/${BUCKET}/o/`;
      if (parsed.pathname.startsWith(firebasePrefix)) {
        return decodeURIComponent(parsed.pathname.slice(firebasePrefix.length));
      }
    }
  } catch {
    return null;
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
  const firstConfiguredUrl = Object.values(audioUrls || {}).find((value) => typeof value === "string" && value.length > 0) || "";
  const candidateUrls = Array.from(
    new Set(
      [audioUrls?.[locale] || "", audioUrls?.en || "", firstConfiguredUrl]
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  for (const stored of candidateUrls) {
    // --- Case 1: Already a Firebase download URL (has token) ---
    if (isFirebaseDownloadUrl(stored)) {
      return stored;
    }

    // --- Case 2: GCS public URL → convert to Firebase download URL ---
    const gcsPath = extractPathFromGcsUrl(stored);
    if (gcsPath) {
      // Prefer tokenized URL when available, but do not block playback waiting on SDK calls.
      const downloadUrl = await withTimeout(getStorageDownloadUrl(gcsPath), 1500);
      if (downloadUrl) return downloadUrl;
      return stored;
    }

    // --- Case 3: Other HTTP URL (e.g. external CDN) → use as-is ---
    if (stored.startsWith("http://") || stored.startsWith("https://")) {
      return stored;
    }

    // Sometimes Firestore stores plain object paths.
    const asStoragePath = await getStorageDownloadUrl(stored);
    if (asStoragePath) return asStoragePath;
  }

  // --- Case 4: No URL or non-HTTP path → try the well-known storage path ---
  // Files in storage are 1-indexed: page_1.mp3 corresponds to Firestore page index 0
  const fileIndex = pageIndex + 1;
  const fallbackPath = `stories/${storyId}/audio/${locale}/page_${fileIndex}.mp3`;
  const localizedFallbackUrl = await getStorageDownloadUrl(fallbackPath);
  if (localizedFallbackUrl) return localizedFallbackUrl;

  // English fallback path helps when a localized narration is missing.
  if (locale !== "en") {
    const englishFallbackPath = `stories/${storyId}/audio/en/page_${fileIndex}.mp3`;
    const englishFallbackUrl = await getStorageDownloadUrl(englishFallbackPath);
    if (englishFallbackUrl) return englishFallbackUrl;
  }

  return "";
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

/**
 * Server-side content fetching utilities
 * Use this in server components instead of the client version
 */

type SiteContent = Record<string, unknown>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const deepMerge = (base: SiteContent, override: SiteContent): SiteContent => {
  const result: SiteContent = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (isObject(value) && isObject(result[key])) {
      result[key] = deepMerge(result[key] as SiteContent, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Fetch site content from API (server-side)
 * This version doesn't use client-side cache and works in server components
 */
export async function getSiteContent<T extends SiteContent>(
  locale: string,
  fallback: T
): Promise<T> {
  const cacheKey = locale.toLowerCase();
  const apiBase = process.env.NEXT_PUBLIC_FEEDBACK_API_BASE_URL || "";
  
  if (!apiBase) {
    return fallback;
  }

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/content?locale=${cacheKey}`, {
      headers: { Accept: "application/json" },
      // Use 'force-cache' for static generation, or 'no-store' for fresh data
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as SiteContent | null;
    if (!data || typeof data !== "object" || (data as { empty?: boolean }).empty) {
      return fallback;
    }

    // Remove locale and empty fields from API response
    const { locale: _, empty: __, ...contentData } = data;
    
    const merged = deepMerge(fallback, contentData) as T;
    return merged;
  } catch (error) {
    // In production, you might want to log this
    console.error('Failed to fetch site content:', error);
    return fallback;
  }
}


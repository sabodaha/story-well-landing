type SiteContent = Record<string, unknown>;

const contentCache = new Map<string, SiteContent>();

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

export const getSiteContent = async <T extends SiteContent>(
  locale: string,
  fallback: T
): Promise<T> => {
  const cacheKey = locale.toLowerCase();
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey) as T;
  }

  const apiBase = process.env.NEXT_PUBLIC_FEEDBACK_API_BASE_URL || "";
  if (!apiBase) {
    return fallback;
  }

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/content?locale=${cacheKey}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as SiteContent | null;
    if (!data || typeof data !== "object") {
      return fallback;
    }

    const merged = deepMerge(fallback, data) as T;
    contentCache.set(cacheKey, merged);
    return merged;
  } catch {
    return fallback;
  }
};

export const clearContentCache = () => {
  contentCache.clear();
};






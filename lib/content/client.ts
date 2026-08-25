type SiteContent = Record<string, unknown>;

type StoredEntry = {
  v: number;
  t: number;
  data: SiteContent;
};

// Bump when the stored envelope shape changes, so old entries are ignored
// instead of being read as the current shape.
const STORE_VERSION = 1;
const STORE_PREFIX = "storywell:content:v1:";

// Content is edited in the admin panel and published to Firestore. Five minutes
// is long enough that normal in-session navigation never pays the ~350ms warm
// (or ~2.7s cold) Cloud Function call again, and short enough that an editor
// reloading the tab after a publish is never stuck for long. Because this lives
// in sessionStorage, a brand-new tab starts empty regardless of the TTL.
const TTL_MS = 5 * 60 * 1000;

const contentCache = new Map<string, SiteContent>();
const inflight = new Map<string, Promise<SiteContent>>();

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

const getStore = (): Storage | null => {
  try {
    if (typeof window === "undefined") return null;
    const store = window.sessionStorage;
    if (!store) return null;
    // Safari private mode and locked-down profiles expose the object but throw
    // on write, so probe once rather than trusting its presence.
    const probe = `${STORE_PREFIX}probe`;
    store.setItem(probe, "1");
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
};

const storeKey = (locale: string) => `${STORE_PREFIX}${locale}`;

const readStored = (locale: string): SiteContent | null => {
  const store = getStore();
  if (!store) return null;
  const key = storeKey(locale);
  try {
    const raw = store.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (
      !isObject(parsed) ||
      parsed.v !== STORE_VERSION ||
      typeof parsed.t !== "number" ||
      !Number.isFinite(parsed.t) ||
      !isObject(parsed.data)
    ) {
      store.removeItem(key);
      return null;
    }

    const age = Date.now() - parsed.t;
    // A negative age means the clock moved backwards; treat it as expired.
    if (age < 0 || age > TTL_MS) {
      store.removeItem(key);
      return null;
    }

    return parsed.data as SiteContent;
  } catch {
    try {
      store.removeItem(key);
    } catch {
      /* storage unusable; nothing to clean up */
    }
    return null;
  }
};

const writeStored = (locale: string, data: SiteContent) => {
  const store = getStore();
  if (!store) return;
  const entry: StoredEntry = { v: STORE_VERSION, t: Date.now(), data };
  try {
    store.setItem(storeKey(locale), JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage revoked mid-session: caching is best-effort.
  }
};

const fetchContent = async (locale: string): Promise<SiteContent | null> => {
  const apiBase = process.env.NEXT_PUBLIC_FEEDBACK_API_BASE_URL || "";
  if (!apiBase) return null;

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/content?locale=${locale}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as unknown;
    if (!isObject(data)) return null;

    return data as SiteContent;
  } catch {
    return null;
  }
};

export const getSiteContent = async <T extends SiteContent>(
  locale: string,
  fallback: T
): Promise<T> => {
  const cacheKey = typeof locale === "string" ? locale.toLowerCase() : "";
  if (!cacheKey) return fallback;

  try {
    const memory = contentCache.get(cacheKey);
    if (memory) {
      return deepMerge(fallback, memory) as T;
    }

    const stored = readStored(cacheKey);
    if (stored) {
      contentCache.set(cacheKey, stored);
      // Re-merge over the current fallback so a payload cached before a deploy
      // still picks up any keys the new default content added.
      return deepMerge(fallback, stored) as T;
    }

    let pending = inflight.get(cacheKey);
    if (!pending) {
      pending = fetchContent(cacheKey).then((remote) => {
        if (!remote) return {};
        contentCache.set(cacheKey, remote);
        writeStored(cacheKey, remote);
        return remote;
      });
      inflight.set(cacheKey, pending);
      pending.finally(() => {
        if (inflight.get(cacheKey) === pending) inflight.delete(cacheKey);
      });
    }

    const remote = await pending;
    return deepMerge(fallback, remote) as T;
  } catch {
    return fallback;
  }
};

export const clearContentCache = () => {
  contentCache.clear();
  inflight.clear();
  const store = getStore();
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && key.startsWith(STORE_PREFIX)) keys.push(key);
    }
    for (const key of keys) store.removeItem(key);
  } catch {
    // Storage went away between the probe and the sweep; nothing to do.
  }
};

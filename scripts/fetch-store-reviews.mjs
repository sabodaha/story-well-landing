#!/usr/bin/env node
/**
 * Collects real store reviews into lib/data/store-reviews.json for the landing page.
 *
 * Apple is fetched automatically from the public customer-reviews RSS feed, which is
 * per-storefront: a review left in the Ukrainian store is invisible from the US feed,
 * so every storefront the app ships to has to be asked separately.
 *
 * Google Play has no public reviews API and its listing renders reviews client-side,
 * so those live in scripts/curated-reviews.json and are updated by hand from
 * Play Console → Monitoring → Ratings and reviews → Reviews (or its CSV export).
 *
 * Nothing here invents or edits review text. Run before a deploy:
 *   node scripts/fetch-store-reviews.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const APP_ID = "6759845142";
const OUT = resolve(REPO, "lib/data/store-reviews.json");
const CURATED = resolve(HERE, "curated-reviews.json");

// Storefronts worth asking. The app's own eight languages plus the English-speaking
// markets it is listed in; a storefront with no reviews simply returns an empty feed.
const STOREFRONTS = [
  "ua", "de", "us", "gb", "ru", "it", "fr", "tr", "es",
  "pl", "ca", "au", "at", "ch", "nl", "cz",
];

const feedUrl = (cc) =>
  `https://itunes.apple.com/${cc}/rss/customerreviews/page=1/id=${APP_ID}/sortby=mostrecent/json`;

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

/**
 * Best-effort source language, used only to label a translation ("translated from
 * Ukrainian") and to skip translating for readers who already share the language.
 * A storefront is a country, not a language — a German-store review is often
 * written in English — so this reads the script actually used.
 */
const STOREFRONT_LANGUAGE = {
  UA: "uk", RU: "ru", DE: "de", AT: "de", CH: "de",
  ES: "es", FR: "fr", IT: "it", TR: "tr",
  US: "en", GB: "en", CA: "en", AU: "en", NL: "en", PL: "en", CZ: "en",
};

const detectLanguage = (text, store) => {
  // Only letters unique to ONE of our languages may decide on their own. Shared
  // accents cannot: ü belongs to German, Spanish, French and Turkish alike, and é
  // to French, Italian and Spanish, so testing them in sequence just rewards
  // whichever language happens to be checked first.
  if (/[іїєґІЇЄҐ]/.test(text)) return "uk";
  if (/[ыъэЫЪЭ]/.test(text)) return "ru";
  if (/[ğışĞİŞ]/.test(text)) return "tr";
  if (/[ßäöÄÖ]/.test(text)) return "de";
  if (/[ñÑ¿¡]/.test(text)) return "es";

  // Ambiguous: Cyrillic without a distinctive letter, or Latin with shared
  // accents. The storefront is a weaker signal than the script, but it beats
  // guessing — and a wrong value here would credit a real person's words to a
  // language they did not write in.
  const fromStore = STOREFRONT_LANGUAGE[String(store).toUpperCase()];
  if (/[Ѐ-ӿ]/.test(text)) {
    return fromStore === "ru" || fromStore === "uk" ? fromStore : "uk";
  }
  if (/[à-ÿÀ-ß]/.test(text) && fromStore) return fromStore;
  return "en";
};

async function fetchAppleStorefront(cc) {
  const response = await fetch(feedUrl(cc), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  // The first entry of the feed is the app itself, not a review: only entries
  // carrying im:rating are customer reviews.
  return asArray(payload?.feed?.entry)
    .filter((entry) => entry?.["im:rating"]?.label)
    .map((entry) => ({
      source: "appstore",
      store: cc.toUpperCase(),
      rating: Number(entry["im:rating"].label),
      title: entry.title?.label ?? "",
      author: entry.author?.name?.label ?? "",
      version: entry["im:version"]?.label ?? "",
      text: (entry.content?.label ?? "").trim(),
      id: entry.id?.label ?? `${cc}-${entry.author?.name?.label ?? ""}-${entry.title?.label ?? ""}`,
    }));
}

async function main() {
  const collected = [];
  const perStore = [];

  for (const cc of STOREFRONTS) {
    try {
      const reviews = await fetchAppleStorefront(cc);
      collected.push(...reviews);
      if (reviews.length) perStore.push(`${cc}:${reviews.length}`);
    } catch (error) {
      perStore.push(`${cc}:ERR(${error.message})`);
    }
  }

  let curated = [];
  try {
    const raw = JSON.parse(readFileSync(CURATED, "utf8"));
    curated = Array.isArray(raw?.reviews) ? raw.reviews : [];
  } catch {
    // No curated file yet — Apple-only output is valid.
  }

  // Translations are expensive to produce and must survive a re-fetch, so they are
  // carried over from the previous output by review id. A review whose text has
  // since been edited by its author loses them deliberately: a stale translation
  // of different words would misquote the person.
  let previous = new Map();
  try {
    const prior = JSON.parse(readFileSync(OUT, "utf8"));
    for (const review of prior.reviews ?? []) {
      previous.set(review.id, review);
    }
  } catch {
    // First run.
  }

  const seen = new Set();
  const all = [...collected, ...curated]
    .filter((review) => {
      if (!review?.text || seen.has(review.id)) return false;
      seen.add(review.id);
      return true;
    })
    .map((review) => {
      const prior = previous.get(review.id);
      const reusable = prior && prior.text === review.text && prior.title === review.title;
      return {
        ...review,
        lang: review.lang ?? prior?.lang ?? detectLanguage(review.text, review.store),
        translations: reusable ? (prior.translations ?? {}) : {},
      };
    });

  // Only 4- and 5-star reviews go on the marketing page. Lower ones are real and
  // worth reading, but they belong in the console, not in a testimonial strip.
  const published = all
    .filter((review) => review.rating >= 4)
    .sort((a, b) => b.rating - a.rating || a.author.localeCompare(b.author));

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    `${JSON.stringify({ generatedFrom: "scripts/fetch-store-reviews.mjs", reviews: published }, null, 2)}\n`,
    "utf8"
  );

  console.log(`storefronts: ${perStore.join(" ") || "(none returned reviews)"}`);
  console.log(`apple: ${collected.length}  curated: ${curated.length}  published (>=4 stars): ${published.length}`);

  const untranslated = published.filter((review) => Object.keys(review.translations).length === 0);
  for (const review of published) {
    const marker = review.translations && Object.keys(review.translations).length ? "" : "  <-- NEEDS TRANSLATION";
    console.log(`  [${review.source}/${review.store} ${review.lang}] ${review.rating}* ${review.author}: ${review.text.slice(0, 50)}${marker}`);
  }
  if (untranslated.length) {
    console.log(`\n${untranslated.length} review(s) have no translations yet. The site falls back to the`);
    console.log(`original text for those, which is correct but not localized. See scripts/REVIEWS.md.`);
  }
  console.log(`wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

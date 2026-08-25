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

  const seen = new Set();
  const all = [...collected, ...curated].filter((review) => {
    if (!review?.text || seen.has(review.id)) return false;
    seen.add(review.id);
    return true;
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
  for (const review of published) {
    console.log(`  [${review.source}/${review.store}] ${review.rating}* ${review.author}: ${review.text.slice(0, 60)}`);
  }
  console.log(`wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

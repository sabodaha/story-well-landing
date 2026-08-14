// Uploads a batch of one-time Google Play promo codes (exported as CSV from
// Play Console → Monetize with Play → Promo codes) into the `promo_codes`
// Firestore collection, where the promoDispenser Cloud Function hands them
// out one per visitor.
//
// Usage (from landing-page/functions/):
//   set GOOGLE_APPLICATION_CREDENTIALS=E:\path\to\service-account.json
//   node scripts/upload-promo-codes.mjs <codes.csv> <campaign>
//
// Example:
//   node scripts/upload-promo-codes.mjs E:\Projects\promo\kazka_android.csv kazka
//
// Re-running with the same file is safe: existing codes are skipped.

import { readFileSync } from "node:fs";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const [, , csvPath, campaignArg] = process.argv;
if (!csvPath || !campaignArg) {
  console.error("Usage: node scripts/upload-promo-codes.mjs <codes.csv> <campaign>");
  process.exit(1);
}
const campaign = campaignArg.trim().toLowerCase();

initializeApp({ credential: applicationDefault(), projectId: "kidsstoriesapp" });
const db = getFirestore();

const raw = readFileSync(csvPath, "utf8");
const codes = [
  ...new Set(
    raw
      .split(/[\r\n,;]+/)
      .map((token) => token.trim().replace(/^"|"$/g, ""))
      .filter((token) => /^[A-Z0-9-]{6,24}$/i.test(token))
      .map((token) => token.toUpperCase())
  ),
];

if (!codes.length) {
  console.error("No promo codes found in the file — check the CSV format.");
  process.exit(1);
}
console.log(`Uploading ${codes.length} codes to campaign "${campaign}"...`);

let written = 0;
let skipped = 0;
for (let i = 0; i < codes.length; i += 400) {
  const chunk = codes.slice(i, i + 400);
  const existing = await db.getAll(
    ...chunk.map((code) => db.collection("promo_codes").doc(code))
  );
  const batch = db.batch();
  chunk.forEach((code, j) => {
    if (existing[j].exists) {
      skipped += 1;
      return;
    }
    batch.set(db.collection("promo_codes").doc(code), {
      campaign,
      status: "available",
      createdAt: new Date(),
    });
    written += 1;
  });
  await batch.commit();
}

console.log(`Done: ${written} uploaded, ${skipped} already existed.`);

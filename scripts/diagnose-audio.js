#!/usr/bin/env node
/**
 * Diagnostic script: Check what audio data exists in Firestore and Storage
 * for the theMoonbellQuest story.
 */

const path = require("path");
const SA_PATH = path.resolve(
  "E:/Projects/json05.01.26_kidsstoriesapp-firebase-adminsdk-fbsvc-e462693369.json"
);
process.env.GOOGLE_APPLICATION_CREDENTIALS = SA_PATH;

const BUCKET_NAME = "kidsstoriesapp.firebasestorage.app";
const STORY_ID = "theMoonbellQuest";

async function main() {
  const admin = require("firebase-admin");
  const { Storage } = require("@google-cloud/storage");

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(SA_PATH),
      storageBucket: BUCKET_NAME,
    });
  }

  const db = admin.firestore();
  const storage = new Storage();
  const bucket = storage.bucket(BUCKET_NAME);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Audio Diagnostics for:", STORY_ID);
  console.log("═══════════════════════════════════════════════════════════\n");

  // --- 1. Check Firestore pages ---
  console.log("=== 1. Firestore Pages ===\n");
  const pagesSnap = await db
    .collection("stories")
    .doc(STORY_ID)
    .collection("pages")
    .orderBy("index")
    .get();

  if (pagesSnap.empty) {
    console.log("  ⚠ No pages found for this story!");
    return;
  }

  for (const doc of pagesSnap.docs) {
    const data = doc.data();
    console.log(`  Page ${data.index}:`);
    console.log(`    imageUrl: ${data.imageUrl || "(empty)"}`);
    console.log(`    audioUrls: ${JSON.stringify(data.audioUrls || {})}`);
    console.log(`    caption (en): ${(data.caption?.en || "(empty)").substring(0, 60)}...`);
    console.log("");
  }

  // --- 2. Check Storage bucket permissions ---
  console.log("=== 2. Storage Bucket IAM ===\n");
  try {
    const [policy] = await bucket.iam.getPolicy({ requestedPolicyVersion: 3 });
    const publicBindings = (policy.bindings || []).filter((b) =>
      b.members?.some((m) => m === "allUsers" || m === "allAuthenticatedUsers")
    );
    if (publicBindings.length > 0) {
      console.log("  Public access bindings found:");
      for (const b of publicBindings) {
        console.log(`    ${b.role} -> ${b.members.join(", ")}`);
      }
    } else {
      console.log("  ⚠ NO public access bindings (bucket is private)");
      console.log("    Direct storage.googleapis.com URLs will return 403.");
    }
  } catch (e) {
    console.log("  Error checking IAM:", e.message);
  }
  console.log("");

  // --- 3. List audio files in storage ---
  console.log("=== 3. Storage Files ===\n");
  console.log(`  Looking for: stories/${STORY_ID}/audio/\n`);
  try {
    const [files] = await bucket.getFiles({
      prefix: `stories/${STORY_ID}/audio/`,
      maxResults: 50,
    });

    if (files.length === 0) {
      console.log("  ⚠ No audio files found at this path!");

      // Try other paths
      console.log("\n  Searching other common audio paths...");
      for (const prefix of [
        `stories/${STORY_ID}/`,
        `media/stories/${STORY_ID}/`,
        `audio/`,
      ]) {
        const [otherFiles] = await bucket.getFiles({
          prefix,
          maxResults: 20,
        });
        const audioFiles = otherFiles.filter((f) =>
          f.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)
        );
        if (audioFiles.length > 0) {
          console.log(`\n  Found ${audioFiles.length} audio file(s) under "${prefix}":`);
          for (const f of audioFiles) {
            console.log(`    ${f.name}`);
          }
        }
      }
    } else {
      console.log(`  Found ${files.length} file(s):`);
      for (const f of files) {
        console.log(`    ${f.name}  (${f.metadata.size} bytes)`);
      }
    }
  } catch (e) {
    console.log("  Error listing files:", e.message);
  }
  console.log("");

  // --- 4. Try to generate a signed download URL ---
  console.log("=== 4. Download URL Test ===\n");
  const testPath = `stories/${STORY_ID}/audio/en/page_0.mp3`;
  try {
    const file = bucket.file(testPath);
    const [exists] = await file.exists();
    if (exists) {
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 3600 * 1000,
      });
      console.log(`  ✓ File exists: ${testPath}`);
      console.log(`    Signed URL: ${url.substring(0, 100)}...`);
    } else {
      console.log(`  ✗ File does NOT exist: ${testPath}`);
    }
  } catch (e) {
    console.log(`  Error for ${testPath}:`, e.message);
  }
  console.log("");

  // --- 5. List ALL files under the story folder ---
  console.log("=== 5. All Files Under Story Folder ===\n");
  try {
    const [allFiles] = await bucket.getFiles({
      prefix: `stories/${STORY_ID}/`,
      maxResults: 100,
    });
    if (allFiles.length === 0) {
      console.log(`  ⚠ No files found under stories/${STORY_ID}/`);

      // Try top-level listing
      console.log("\n  Listing top-level prefixes in bucket...");
      const [topFiles] = await bucket.getFiles({
        prefix: "",
        delimiter: "/",
        maxResults: 20,
      });
      const [, , apiResponse] = await bucket.getFiles({
        prefix: "",
        delimiter: "/",
        autoPaginate: false,
      });
      if (apiResponse && apiResponse.prefixes) {
        console.log("  Top-level folders:", apiResponse.prefixes);
      } else {
        console.log("  Top-level files:", topFiles.map((f) => f.name).slice(0, 20));
      }
    } else {
      console.log(`  ${allFiles.length} file(s):`);
      for (const f of allFiles.slice(0, 30)) {
        console.log(`    ${f.name}`);
      }
      if (allFiles.length > 30) {
        console.log(`    ... and ${allFiles.length - 30} more`);
      }
    }
  } catch (e) {
    console.log("  Error:", e.message);
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Diagnosis complete");
  console.log("═══════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});



#!/usr/bin/env node
/**
 * Enable Firebase App Check enforcement for Firestore and Cloud Storage.
 *
 * ⚠️  PREREQUISITES — DO NOT RUN until BOTH are true:
 *  1. The Android (Flutter) app has App Check activated with PlayIntegrity.
 *     In main.dart, uncomment and change:
 *       await FirebaseAppCheck.instance.activate(
 *         androidProvider: AndroidProvider.playIntegrity,
 *       );
 *     Then publish a new release to Play Store and ensure most users have updated.
 *  2. The web app's NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY is set to a valid
 *     reCAPTCHA v3 site key.
 *
 * What this script does:
 *  - Uses the Firebase Management REST API to enable App Check enforcement
 *    for Cloud Firestore and Cloud Storage.
 *  - After enforcement, any client request without a valid App Check token
 *    will be rejected (403).
 *
 * Usage:
 *   node scripts/setup-appcheck-enforcement.js [--dry-run]
 *
 * Reference:
 *   https://firebase.google.com/docs/app-check/admin/manage-services
 */

const path = require("path");
const https = require("https");

const SA_PATH = path.resolve(
  "E:/Projects/json05.01.26_kidsstoriesapp-firebase-adminsdk-fbsvc-e462693369.json"
);
const PROJECT_ID = "kidsstoriesapp";
const DRY_RUN = process.argv.includes("--dry-run");

// Services to enforce
const SERVICES = [
  "firestore.googleapis.com",     // Cloud Firestore
  "firebasestorage.googleapis.com" // Cloud Storage for Firebase
];

// ---------------------------------------------------------------------------
// Auth: Get an access token from the service account
// ---------------------------------------------------------------------------

async function getAccessToken() {
  const { GoogleAuth } = require("google-auth-library");
  const auth = new GoogleAuth({
    keyFilename: SA_PATH,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

// ---------------------------------------------------------------------------
// REST call to update App Check enforcement
// ---------------------------------------------------------------------------

function apiCall(method, urlPath, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "firebaseappcheck.googleapis.com",
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Firebase App Check Enforcement");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Project:  ${PROJECT_ID}`);
  console.log(`  Dry run:  ${DRY_RUN}`);
  console.log(`  Services: ${SERVICES.join(", ")}`);
  console.log("");

  if (DRY_RUN) {
    console.log("  [DRY RUN] No changes will be made.\n");
  }

  const token = await getAccessToken();
  console.log("  ✓ Authenticated with service account\n");

  for (const service of SERVICES) {
    const resourceName = `projects/${PROJECT_ID}/services/${service}`;
    const urlPath = `/v1/${resourceName}`;

    // Check current state
    const getResult = await apiCall("GET", urlPath, token);
    console.log(`  ${service}:`);
    console.log(`    Current state: ${JSON.stringify(getResult.body.enforcementMode || "UNENFORCED")}`);

    if (DRY_RUN) {
      console.log("    [DRY RUN] Would set enforcementMode to ENFORCED\n");
      continue;
    }

    // Enforce
    const patchPath = `${urlPath}?updateMask=enforcementMode`;
    const patchResult = await apiCall("PATCH", patchPath, token, {
      enforcementMode: "ENFORCED",
    });

    if (patchResult.status === 200) {
      console.log("    ✓ Enforcement ENABLED\n");
    } else {
      console.error(`    ✗ Failed (HTTP ${patchResult.status}):`, patchResult.body);
      console.log("");
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  if (!DRY_RUN) {
    console.log("  Done! App Check is now enforced.");
    console.log("  Clients without valid App Check tokens will be blocked.");
  } else {
    console.log("  Dry run complete. Re-run without --dry-run to enforce.");
  }
  console.log("═══════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});


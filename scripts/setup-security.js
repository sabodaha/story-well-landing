#!/usr/bin/env node
/**
 * One-time security setup script for the Story Well project.
 *
 * What it does:
 * 1. Removes public (allUsers) read access from the Firebase Storage GCS bucket
 *    so that direct https://storage.googleapis.com/... URLs no longer work.
 *    Firebase SDK access (firebasestorage.googleapis.com) still works via
 *    Firebase Storage rules.
 * 2. Attempts to create a $50/month budget alert (requires billing permissions).
 *
 * Usage:
 *   node scripts/setup-security.js
 *
 * Requires:
 *   GOOGLE_APPLICATION_CREDENTIALS env var pointing to the service account JSON,
 *   or pass the path as the first argument.
 */

const path = require("path");

// Resolve service account path
const SA_PATH =
  process.argv[2] ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.resolve("E:/Projects/json05.01.26_kidsstoriesapp-firebase-adminsdk-fbsvc-e462693369.json");

process.env.GOOGLE_APPLICATION_CREDENTIALS = SA_PATH;

const BUCKET_NAME = "kidsstoriesapp.firebasestorage.app";
const PROJECT_ID = "kidsstoriesapp";

// ---------------------------------------------------------------------------
// 1. Remove public GCS access
// ---------------------------------------------------------------------------

async function removePublicAccess() {
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage({ projectId: PROJECT_ID });
  const bucket = storage.bucket(BUCKET_NAME);

  console.log(`\n=== Removing public access from bucket: ${BUCKET_NAME} ===`);

  try {
    const [policy] = await bucket.iam.getPolicy({ requestedPolicyVersion: 3 });

    const originalCount = policy.bindings?.length || 0;

    // Filter out any binding that grants allUsers or allAuthenticatedUsers read access
    policy.bindings = (policy.bindings || []).filter((binding) => {
      const isPublicRead =
        binding.role === "roles/storage.objectViewer" &&
        binding.members?.some(
          (m) => m === "allUsers" || m === "allAuthenticatedUsers"
        );
      const isPublicLegacy =
        binding.role === "roles/storage.legacyObjectReader" &&
        binding.members?.some(
          (m) => m === "allUsers" || m === "allAuthenticatedUsers"
        );
      if (isPublicRead || isPublicLegacy) {
        console.log(`  Removing binding: ${binding.role} -> ${binding.members}`);
        return false;
      }
      return true;
    });

    // Also remove allUsers/allAuthenticatedUsers from any remaining binding
    for (const binding of policy.bindings) {
      if (binding.members) {
        binding.members = binding.members.filter(
          (m) => m !== "allUsers" && m !== "allAuthenticatedUsers"
        );
      }
    }

    // Remove empty bindings
    policy.bindings = policy.bindings.filter(
      (b) => b.members && b.members.length > 0
    );

    if (policy.bindings.length < originalCount) {
      await bucket.iam.setPolicy(policy);
      console.log("  ✓ Public access removed. Direct GCS URLs will return 403.");
    } else {
      console.log("  ✓ No public access bindings found — bucket is already restricted.");
    }
  } catch (err) {
    console.error("  ✗ Failed to update bucket IAM:", err.message);
    console.error("    You may need to grant the service account 'Storage Admin' role on the bucket.");
  }
}

// ---------------------------------------------------------------------------
// 2. Create budget alert
// ---------------------------------------------------------------------------

async function createBudgetAlert() {
  console.log("\n=== Creating $50/month budget alert ===");

  try {
    const { BudgetServiceClient } = require("@google-cloud/billing-budgets");
    const client = new BudgetServiceClient();

    // First we need the billing account ID. The service account may not have
    // access to list billing accounts. If not, we print manual instructions.
    const { CloudBillingClient } = require("@google-cloud/billing").v1 || {};

    let billingAccountName = null;

    try {
      // Try to get billing info for the project
      const billing = new (require("@google-cloud/billing").CloudBillingClient)();
      const [info] = await billing.getProjectBillingInfo({
        name: `projects/${PROJECT_ID}`,
      });
      billingAccountName = info.billingAccountName;
      console.log(`  Found billing account: ${billingAccountName}`);
    } catch (e) {
      console.log("  Could not auto-detect billing account:", e.message);
      console.log("\n  ──────────────────────────────────────────────────────────");
      console.log("  MANUAL STEP: Create a $50 budget alert in Google Cloud Console:");
      console.log("  1. Go to https://console.cloud.google.com/billing");
      console.log("  2. Select your billing account");
      console.log("  3. Go to 'Budgets & alerts'");
      console.log("  4. Click 'CREATE BUDGET'");
      console.log("  5. Set budget amount to $50");
      console.log("  6. Add alert thresholds at 50%, 80%, 100%");
      console.log("  7. Add your email for notifications");
      console.log("  ──────────────────────────────────────────────────────────\n");
      return;
    }

    if (!billingAccountName) {
      console.log("  No billing account linked to project. Skipping budget creation.");
      return;
    }

    // Create the budget
    const [budget] = await client.createBudget({
      parent: billingAccountName,
      budget: {
        displayName: "Story Well - $50 Monthly Cap",
        budgetFilter: {
          projects: [`projects/${PROJECT_ID}`],
          calendarPeriod: "MONTH",
        },
        amount: {
          specifiedAmount: {
            currencyCode: "USD",
            units: 50,
            nanos: 0,
          },
        },
        thresholdRules: [
          { thresholdPercent: 0.5, spendBasis: "CURRENT_SPEND" },
          { thresholdPercent: 0.8, spendBasis: "CURRENT_SPEND" },
          { thresholdPercent: 1.0, spendBasis: "CURRENT_SPEND" },
        ],
        notificationsRule: {
          disableDefaultIamRecipients: false,
        },
      },
    });

    console.log(`  ✓ Budget created: ${budget.name}`);
    console.log(`    Amount: $50/month`);
    console.log(`    Alerts at: 50%, 80%, 100%`);
  } catch (err) {
    console.error("  ✗ Budget creation failed:", err.message);
    console.log("\n  ──────────────────────────────────────────────────────────");
    console.log("  MANUAL STEP: Create a $50 budget alert in Google Cloud Console:");
    console.log("  1. Go to https://console.cloud.google.com/billing");
    console.log("  2. Select your billing account");
    console.log("  3. Go to 'Budgets & alerts'");
    console.log("  4. Click 'CREATE BUDGET'");
    console.log("  5. Set budget amount to $50");
    console.log("  6. Add alert thresholds at 50%, 80%, 100%");
    console.log("  7. Add your email for notifications");
    console.log("  ──────────────────────────────────────────────────────────\n");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  console.log("Story Well Security Setup");
  console.log("=".repeat(50));
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Bucket:  ${BUCKET_NAME}`);
  console.log(`SA Key:  ${SA_PATH}`);

  await removePublicAccess();
  await createBudgetAlert();

  console.log("\n=== Done ===\n");
})();


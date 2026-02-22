#!/usr/bin/env node
/**
 * Attempt to create a $50/month budget alert for the kidsstoriesapp project.
 *
 * The Firebase Admin SDK service account typically does NOT have billing
 * permissions, so this script will likely fail and print manual instructions.
 *
 * Usage:
 *   node scripts/setup-budget-alert.js
 */

const path = require("path");

const SA_PATH = path.resolve(
  "E:/Projects/json05.01.26_kidsstoriesapp-firebase-adminsdk-fbsvc-e462693369.json"
);
process.env.GOOGLE_APPLICATION_CREDENTIALS = SA_PATH;

const PROJECT_ID = "kidsstoriesapp";

async function main() {
  console.log("=== Budget Alert Setup ===\n");

  // --- Step 1: Try to discover billing account ---------------------------------
  let billingAccountName = null;

  try {
    const { CloudBillingClient } = require("@google-cloud/billing");
    const billing = new CloudBillingClient();
    const [info] = await billing.getProjectBillingInfo({
      name: `projects/${PROJECT_ID}`,
    });
    billingAccountName = info.billingAccountName;
    console.log(`Billing account found: ${billingAccountName}`);
  } catch (e) {
    console.log(`Could not auto-detect billing account: ${e.message}\n`);
    printManualInstructions();
    return;
  }

  if (!billingAccountName) {
    console.log("No billing account linked to this project.\n");
    printManualInstructions();
    return;
  }

  // --- Step 2: Create budget ---------------------------------------------------
  try {
    const { BudgetServiceClient } = require("@google-cloud/billing-budgets");
    const budgets = new BudgetServiceClient();

    const [budget] = await budgets.createBudget({
      parent: billingAccountName,
      budget: {
        displayName: "Story Well – $50 Monthly Safety Net",
        budgetFilter: {
          projects: [`projects/${PROJECT_ID}`],
          calendarPeriod: "MONTH",
        },
        amount: {
          specifiedAmount: {
            currencyCode: "USD",
            units: "50",
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

    console.log(`✓ Budget created successfully!`);
    console.log(`  Name:    ${budget.displayName}`);
    console.log(`  Amount:  $50/month`);
    console.log(`  Alerts:  50%, 80%, 100%`);
  } catch (e) {
    console.error(`Budget creation failed: ${e.message}\n`);
    printManualInstructions();
  }
}

function printManualInstructions() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  MANUAL STEPS: Create a $50 budget alert");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("  1. Open: https://console.cloud.google.com/billing");
  console.log("  2. Select the billing account for project 'kidsstoriesapp'");
  console.log("  3. Click 'Budgets & alerts' in the left menu");
  console.log("  4. Click '+ CREATE BUDGET'");
  console.log("  5. Name: 'Story Well – $50 Monthly Safety Net'");
  console.log("  6. Scope: Select project 'kidsstoriesapp'");
  console.log("  7. Amount: Set to $50 (Budget type: Specified amount)");
  console.log("  8. Actions:");
  console.log("     - Add threshold at 50% of budget (actual spend)");
  console.log("     - Add threshold at 80% of budget (actual spend)");
  console.log("     - Add threshold at 100% of budget (actual spend)");
  console.log("  9. Manage notifications → add your email");
  console.log(" 10. Click 'Finish' / 'Save'");
  console.log("");
  console.log("  Optional: To auto-DISABLE billing at $50:");
  console.log("  - Deploy a Cloud Function triggered by Pub/Sub budget topic");
  console.log("  - See: https://cloud.google.com/billing/docs/how-to/notify");
  console.log("═══════════════════════════════════════════════════════════");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});











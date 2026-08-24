import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import express, { Request, Response } from "express";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getAppCheck } from "firebase-admin/app-check";
import crypto from "crypto";

initializeApp();

const db = getFirestore();
const auth = getAuth();
const appCheck = getAppCheck();

const app = express();
const DEFAULT_ALLOWED_ORIGINS = [
  "https://dartim-media.com",
  "https://www.dartim-media.com",
  "https://kidsstoriesapp.web.app",
  "https://kidsstoriesapp.firebaseapp.com",
];

const parseAllowedOrigins = () => {
  const envOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value: string) => value.trim())
    .filter(Boolean);
  const merged = envOrigins.length ? [...DEFAULT_ALLOWED_ORIGINS, ...envOrigins] : DEFAULT_ALLOWED_ORIGINS;
  const allowedOrigins = Array.from(new Set(merged));

  return {
    allowAny: allowedOrigins.includes("*"),
    allowedOrigins,
  };
};

const { allowAny: allowAnyOrigin, allowedOrigins } = parseAllowedOrigins();

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (allowAnyOrigin) {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  },
});

app.use(corsMiddleware);
app.use(express.json({ limit: "200kb" }));

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean)
);

const REQUIRE_APP_CHECK = (process.env.REQUIRE_APP_CHECK || "true") !== "false";
const shouldSkipAppCheck = (req: Request) => req.header("X-Admin-Panel") === "true";
const allowedContentLocales = new Set(["en", "de", "es", "fr", "it", "ru", "tr", "uk"]);

const collection = () => db.collection("opinions");
const contentCollection = () => db.collection("site_content");

const getLocaleParam = (req: Request) => {
  const locale = String(req.query.locale || "").trim().toLowerCase();
  return locale || null;
};

const getContentLocale = (req: Request) => {
  const locale = getLocaleParam(req) || "en";
  if (!allowedContentLocales.has(locale)) {
    throw new Error("invalid-locale");
  }
  return locale;
};

const parseLimit = (req: Request, defaultLimit = 20) => {
  const raw = Number(req.query.limit);
  if (!Number.isFinite(raw)) return defaultLimit;
  return Math.min(Math.max(raw, 1), 100);
};

// Salted so a stored hash cannot be walked back to an address: the IPv4 space
// is small enough to enumerate exhaustively. An absent salt degrades to the
// previous behaviour instead of breaking rate limiting.
const IP_HASH_SALT = process.env.IP_HASH_SALT || "";

const hashIp = (ip: string) => {
  return crypto.createHash("sha256").update(IP_HASH_SALT + ip).digest("hex");
};

const getClientIp = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.ip || "unknown";
};

const verifyAppCheck = async (req: Request) => {
  if (!REQUIRE_APP_CHECK) return;
  const token = req.header("X-Firebase-AppCheck");
  if (!token) {
    throw new Error("missing-app-check");
  }
  await appCheck.verifyToken(token);
};

const verifyAdmin = async (req: Request) => {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    throw new Error("missing-auth");
  }

  const decoded = await auth.verifyIdToken(token);
  const email = decoded.email?.toLowerCase() || "";
  const hasAdminClaim = decoded.admin === true || decoded.admin === "true";

  if (hasAdminClaim) {
    return { email, uid: decoded.uid };
  }

  if (!ADMIN_EMAILS.has(email)) {
    throw new Error("not-admin");
  }

  return { email, uid: decoded.uid };
};

const sanitizeOpinion = (docId: string, data: FirebaseFirestore.DocumentData) => ({
  id: docId,
  name: data.name || null,
  storyTitle: data.storyTitle || null,
  rating: data.rating || null,
  message: data.message,
  locale: data.locale || null,
  createdAt: data.createdAt?.toDate?.() ?? null,
  status: data.status,
});

app.get("/opinions", async (req: Request, res: Response) => {
  try {
    const locale = getLocaleParam(req);
    const limit = parseLimit(req);

    let query = collection().where("status", "==", "approved").orderBy("createdAt", "desc").limit(limit);
    if (locale) {
      query = query.where("locale", "==", locale);
    }

    const snapshot = await query.get();
    const opinions = snapshot.docs.map((doc) => sanitizeOpinion(doc.id, doc.data()));

    res.json(opinions);
  } catch (error) {
    logger.error("opinions:list:error", error);
    res.status(500).json({ error: "failed-to-load" });
  }
});

app.post("/opinions", async (req: Request, res: Response) => {
  try {
    await verifyAppCheck(req);

    const { name, storyTitle, rating, message, locale, source } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message-required" });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "rating-invalid" });
    }

    const ipHash = hashIp(getClientIp(req));
    const recent = await collection()
      .where("ipHash", "==", ipHash)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (!recent.empty) {
      const last = recent.docs[0]?.data().createdAt as Timestamp | undefined;
      if (last) {
        const delta = Date.now() - last.toMillis();
        if (delta < 60_000) {
          return res.status(429).json({ error: "rate-limited" });
        }
      }
    }

    const now = FieldValue.serverTimestamp();
    const doc = await collection().add({
      name: typeof name === "string" ? name.trim().slice(0, 120) : null,
      storyTitle: typeof storyTitle === "string" ? storyTitle.trim().slice(0, 160) : null,
      rating: parsedRating,
      message: message.trim().slice(0, 2000),
      locale: typeof locale === "string" ? locale.trim().toLowerCase() : null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      approvedAt: null,
      rejectedAt: null,
      moderatedBy: null,
      ipHash,
      userAgent: req.header("user-agent") || null,
      source: typeof source === "string" ? source : "web",
    });

    res.status(201).json({ id: doc.id, status: "pending" });
  } catch (error) {
    logger.error("opinions:create:error", error);
    if ((error as Error).message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    res.status(500).json({ error: "failed-to-submit" });
  }
});

app.get("/opinions/pending", async (req: Request, res: Response) => {
  try {
    await verifyAdmin(req);
    if (!shouldSkipAppCheck(req)) {
      await verifyAppCheck(req);
    }

    const limit = parseLimit(req, 50);
    const snapshot = await collection()
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const opinions = snapshot.docs.map((doc) => sanitizeOpinion(doc.id, doc.data()));
    res.json(opinions);
  } catch (error) {
    const message = (error as Error).message;
    if (message === "missing-auth" || message === "not-admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    if (message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    logger.error("opinions:pending:error", error);
    res.status(500).json({ error: "failed-to-load" });
  }
});

app.patch("/opinions/:id", async (req: Request, res: Response) => {
  try {
    const admin = await verifyAdmin(req);
    if (!shouldSkipAppCheck(req)) {
      await verifyAppCheck(req);
    }

    const status = String(req.body?.status || "").toLowerCase();
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "invalid-status" });
    }

    const now = FieldValue.serverTimestamp();
    const update: Record<string, unknown> = {
      status,
      updatedAt: now,
      moderatedBy: admin.email,
      approvedAt: status === "approved" ? now : null,
      rejectedAt: status === "rejected" ? now : null,
    };

    await collection().doc(req.params.id).update(update);
    res.json({ status });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "missing-auth" || message === "not-admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    if (message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    logger.error("opinions:patch:error", error);
    res.status(500).json({ error: "failed-to-update" });
  }
});

app.get("/opinions/approved", async (req: Request, res: Response) => {
  try {
    await verifyAdmin(req);
    if (!shouldSkipAppCheck(req)) {
      await verifyAppCheck(req);
    }

    const limit = parseLimit(req, 50);
    const snapshot = await collection()
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const opinions = snapshot.docs.map((doc) => sanitizeOpinion(doc.id, doc.data()));
    res.json(opinions);
  } catch (error) {
    const message = (error as Error).message;
    if (message === "missing-auth" || message === "not-admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    if (message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    logger.error("opinions:approved:error", error);
    res.status(500).json({ error: "failed-to-load" });
  }
});

app.patch("/opinions/:id/edit", async (req: Request, res: Response) => {
  try {
    const admin = await verifyAdmin(req);
    if (!shouldSkipAppCheck(req)) {
      await verifyAppCheck(req);
    }

    const { name, storyTitle, rating, message, locale } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message-required" });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "rating-invalid" });
    }

    const now = FieldValue.serverTimestamp();
    const update: Record<string, unknown> = {
      name: typeof name === "string" ? name.trim().slice(0, 120) : null,
      storyTitle: typeof storyTitle === "string" ? storyTitle.trim().slice(0, 160) : null,
      rating: parsedRating,
      message: message.trim().slice(0, 2000),
      locale: typeof locale === "string" ? locale.trim().toLowerCase() : null,
      updatedAt: now,
      moderatedBy: admin.email,
    };

    await collection().doc(req.params.id).update(update);
    res.json({ status: "approved" });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "missing-auth" || message === "not-admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    if (message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    logger.error("opinions:edit:error", error);
    res.status(500).json({ error: "failed-to-update" });
  }
});

app.delete("/opinions/:id", async (req: Request, res: Response) => {
  try {
    await verifyAdmin(req);
    if (!shouldSkipAppCheck(req)) {
      await verifyAppCheck(req);
    }

    await collection().doc(req.params.id).delete();
    res.json({ status: "deleted" });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "missing-auth" || message === "not-admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    if (message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    logger.error("opinions:delete:error", error);
    res.status(500).json({ error: "failed-to-delete" });
  }
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    // Simple health check - verify database connection
    await db.collection("_health").limit(1).get();
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error("health:check:error", error);
    res.status(503).json({ status: "error", timestamp: new Date().toISOString() });
  }
});

app.get("/content", async (req: Request, res: Response) => {
  try {
    // GET /content is public (read-only) - no auth required
    // PUT /content remains admin-only for security

    const locale = getContentLocale(req);
    const doc = await contentCollection().doc(locale).get();
    if (!doc.exists) {
      return res.json({ locale, empty: true });
    }
    return res.json({ locale, ...doc.data() });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "invalid-locale") {
      return res.status(400).json({ error: "invalid-locale" });
    }
    logger.error("content:get:error", error);
    res.status(500).json({ error: "failed-to-load" });
  }
});

app.put("/content", async (req: Request, res: Response) => {
  try {
    const admin = await verifyAdmin(req);
    if (!shouldSkipAppCheck(req)) {
      await verifyAppCheck(req);
    }

    const locale = getContentLocale(req);
    const payload = req.body || {};
    if (typeof payload !== "object" || payload === null) {
      return res.status(400).json({ error: "invalid-payload" });
    }

    const now = FieldValue.serverTimestamp();
    await contentCollection()
      .doc(locale)
      .set(
        {
          ...payload,
          locale,
          updatedAt: now,
          updatedBy: admin.email,
        },
        { merge: true }
      );

    res.json({ status: "saved", locale });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "invalid-locale") {
      return res.status(400).json({ error: "invalid-locale" });
    }
    if (message === "missing-auth" || message === "not-admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    if (message === "missing-app-check") {
      return res.status(401).json({ error: "missing-app-check" });
    }
    logger.error("content:put:error", error);
    res.status(500).json({ error: "failed-to-save" });
  }
});

export const opinionBoard = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  app
);

// ---------------------------------------------------------------------------
// Promo code dispenser
//
// Hands out ONE-TIME Google Play subscription promo codes so the landing
// page can deep-link straight into the Play redeem flow
// (https://play.google.com/redeem?code=...). Pools are uploaded with
// functions/scripts/upload-promo-codes.mjs into the `promo_codes`
// collection: doc id = the code, fields { campaign, status, createdAt }.
// The collection is Admin-SDK-only (denied in firestore.rules).
// ---------------------------------------------------------------------------

const promoApp = express();
promoApp.use(corsMiddleware);
promoApp.use(express.json({ limit: "10kb" }));
// sendBeacon payloads arrive as text/plain on purpose: any other content type
// makes the request non-simple, and browsers drop preflighted beacons.
promoApp.use(express.text({ type: "text/plain", limit: "10kb" }));

/// Body of a beacon or a normal JSON post, whichever the caller used.
function readJsonBody(body: unknown): Record<string, unknown> {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

const promoCollection = () => db.collection("promo_codes");
const PROMO_CAMPAIGNS = new Set(["kazka"]);
// Two jobs, two limits. The per-IP cap only has to stop a looping client, so it
// is deliberately loose and short-windowed: mobile carriers put many subscribers
// behind one address, and a Telegram post arrives as a burst from exactly those
// networks. Guarding the pool is the global cap's job, and that one is immune to
// shared addresses.
const PROMO_CLAIMS_PER_IP_PER_HOUR = 10;
const PROMO_CLAIMS_PER_DAY = 200;
const PROMO_LOW_POOL_WARNING = 25;

// Daily counters per placement, readable by the admin panel. One document per
// UTC day: { date, total, bySrc: { <src>: { visits, ios, android, desktop,
// claims } } }. Aggregate-only by design — no IP, no user agent, no identifier
// of any kind — so this stays outside the privacy policy's PII surface.
const promoHitsCollection = () => db.collection("promo_hits");
const PROMO_PLATFORMS = new Set(["ios", "android", "desktop", "other"]);
const NO_SRC = "_none";

function sanitizeTag(raw: unknown, fallback: string | null = null): string | null {
  const clean = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
  return clean || fallback;
}

function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/// Records one landing-page visit. Called from the browser, so it also counts
/// iPhone visitors — the only place iOS is measurable at all, because Apple's
/// redeem URL carries no parameters. Telegram's link-preview crawler does not
/// run JavaScript, so previews are not counted.
promoApp.post("/hit", async (req: Request, res: Response) => {
  try {
    const body = readJsonBody(req.body);
    const campaign = sanitizeTag(body.campaign);
    if (!campaign || !PROMO_CAMPAIGNS.has(campaign)) {
      return res.status(400).json({ error: "unknown-campaign" });
    }
    const src = sanitizeTag(body.src, NO_SRC) as string;
    const rawPlatform = sanitizeTag(body.platform) || "other";
    const platform = PROMO_PLATFORMS.has(rawPlatform) ? rawPlatform : "other";

    // A beacon from our own page always carries an Origin header; curl and
    // scripts normally do not. Those are counted apart so the visit numbers
    // stay a picture of real browsers. Nothing is rejected — an attacker
    // should not be able to tell which bucket they landed in.
    const origin = String(req.headers.origin || "");
    const fromBrowser = allowedOrigins.includes(origin);
    const userAgent = String(req.header("user-agent") || "").toLowerCase();
    const looksAutomated =
      !userAgent ||
      /bot|crawl|spider|headless|scrap|preview|curl|wget|python-requests|okhttp|axios|node-fetch/.test(
        userAgent
      );

    const counters: Record<string, unknown> = {
      date: utcDateKey(),
      campaign,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!fromBrowser) {
      counters.suspicious = FieldValue.increment(1);
    } else if (looksAutomated) {
      counters.bots = FieldValue.increment(1);
    } else {
      counters.total = FieldValue.increment(1);
      counters.bySrc = {
        [src]: {
          visits: FieldValue.increment(1),
          [platform]: FieldValue.increment(1),
        },
      };
    }

    await promoHitsCollection().doc(utcDateKey()).set(counters, { merge: true });

    return res.status(204).send();
  } catch (error) {
    logger.error("promo:hit:error", error);
    // Never fail the page over a counter.
    return res.status(204).send();
  }
});

promoApp.post("/claim", async (req: Request, res: Response) => {
  try {
    const campaign = String(req.body?.campaign || "").trim().toLowerCase();
    if (!PROMO_CAMPAIGNS.has(campaign)) {
      return res.status(400).json({ error: "unknown-campaign" });
    }

    // Placement id the landing page picked up from ?src=, e.g. the Telegram
    // community a link was posted in. Sanitised again here because the client
    // is not a trust boundary.
    const src = sanitizeTag(req.body?.src);

    // Per-IP, short window: enough to stop a looping client, loose enough that a
    // whole carrier NAT sharing one address is not locked out for a day.
    const ipHash = hashIp(getClientIp(req));
    const since = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
    const recentClaims = await promoCollection()
      .where("claimedIpHash", "==", ipHash)
      .where("claimedAt", ">", since)
      .limit(PROMO_CLAIMS_PER_IP_PER_HOUR)
      .get();
    if (recentClaims.size >= PROMO_CLAIMS_PER_IP_PER_HOUR) {
      return res.status(429).json({ error: "rate-limited" });
    }

    // Global daily cap: the real guard on the pool, and unaffected by shared
    // addresses. One document read, from the counters we already maintain.
    const todayCounters = await promoHitsCollection().doc(utcDateKey()).get();
    const claimsToday = Number(todayCounters.get("claims") || 0);
    if (claimsToday >= PROMO_CLAIMS_PER_DAY) {
      logger.warn("promo:claim:daily-cap-reached", { campaign, claimsToday });
      return res.status(429).json({ error: "daily-cap" });
    }

    const code = await db.runTransaction(async (tx) => {
      const snap = await tx.get(
        promoCollection()
          .where("campaign", "==", campaign)
          .where("status", "==", "available")
          .limit(1)
      );
      if (snap.empty) return null;
      const doc = snap.docs[0];
      tx.update(doc.ref, {
        status: "claimed",
        claimedAt: FieldValue.serverTimestamp(),
        claimedIpHash: ipHash,
        claimedUserAgent: req.header("user-agent") || null,
        claimedSrc: src,
      });
      return doc.id;
    });

    if (!code) {
      logger.warn("promo:claim:pool-empty", { campaign });
      return res.status(410).json({ error: "pool-empty" });
    }

    // Mirror the claim into the daily counters so the admin panel can show the
    // whole funnel (visits → claims) from one readable collection.
    promoHitsCollection()
      .doc(utcDateKey())
      .set(
        {
          date: utcDateKey(),
          campaign,
          updatedAt: FieldValue.serverTimestamp(),
          claims: FieldValue.increment(1),
          bySrc: { [src || NO_SRC]: { claims: FieldValue.increment(1) } },
        },
        { merge: true }
      )
      .catch((error) => logger.warn("promo:claim:counter-failed", error));

    const remaining = await promoCollection()
      .where("campaign", "==", campaign)
      .where("status", "==", "available")
      .count()
      .get();
    if (remaining.data().count <= PROMO_LOW_POOL_WARNING) {
      logger.warn("promo:claim:pool-low", {
        campaign,
        remaining: remaining.data().count,
      });
    }

    return res.json({ code });
  } catch (error) {
    logger.error("promo:claim:error", error);
    return res.status(500).json({ error: "failed-to-claim" });
  }
});

promoApp.get("/status", async (req: Request, res: Response) => {
  try {
    const campaign = String(req.query.campaign || "").trim().toLowerCase();
    if (!PROMO_CAMPAIGNS.has(campaign)) {
      return res.status(400).json({ error: "unknown-campaign" });
    }
    // Optional ?src= narrows the claimed count to one placement, so a Telegram
    // community's pull can be read without opening the Firestore console.
    const src =
      String(req.query.src || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 32) || null;

    let claimedQuery = promoCollection()
      .where("campaign", "==", campaign)
      .where("status", "==", "claimed");
    if (src) claimedQuery = claimedQuery.where("claimedSrc", "==", src);

    const [available, claimed] = await Promise.all([
      promoCollection()
        .where("campaign", "==", campaign)
        .where("status", "==", "available")
        .count()
        .get(),
      claimedQuery.count().get(),
    ]);
    return res.json({
      campaign,
      ...(src ? { src } : {}),
      available: available.data().count,
      claimed: claimed.data().count,
    });
  } catch (error) {
    logger.error("promo:status:error", error);
    return res.status(500).json({ error: "failed-to-load" });
  }
});

export const promoDispenser = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  promoApp
);


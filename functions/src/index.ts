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
const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
      .split(",")
      .map((value: string) => value.trim())
      .filter(Boolean);

    if (allowedOrigins.includes("*")) {
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

const collection = () => db.collection("opinions");

const getLocaleParam = (req: Request) => {
  const locale = String(req.query.locale || "").trim().toLowerCase();
  return locale || null;
};

const parseLimit = (req: Request, defaultLimit = 20) => {
  const raw = Number(req.query.limit);
  if (!Number.isFinite(raw)) return defaultLimit;
  return Math.min(Math.max(raw, 1), 100);
};

const hashIp = (ip: string) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
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
    await verifyAppCheck(req);
    await verifyAdmin(req);

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
    await verifyAppCheck(req);
    const admin = await verifyAdmin(req);

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

export const opinionBoard = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  app
);


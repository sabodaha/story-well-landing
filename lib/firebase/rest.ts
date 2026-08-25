// Firestore REST access. The client SDK cannot request partial documents, so a
// projected read has to go through the runQuery endpoint with a select mask.

import { getAppCheckToken } from "./client";

const FIRESTORE_REST_HOST = "https://firestore.googleapis.com/v1";
const RETRY_DELAYS_MS = [300, 900];
const REQUEST_TIMEOUT_MS = 15000;
// App Check must never delay a read. Enforcement is off, so an absent token
// costs nothing today; once it is on, a tokenless request 403s and the SDK
// fallback — which carries its own token — takes over.
const APP_CHECK_TIMEOUT_MS = 2000;

// runQuery interleaves documents with bare progress markers; anything carrying
// none of these keys and no document is an element shape we must not ignore.
const PROGRESS_KEYS = new Set(["readTime", "skippedResults", "transaction", "done"]);

export interface RestDocument {
  id: string;
  data: Record<string, unknown>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

export const documentIdFromName = (name: unknown): string => {
  if (typeof name !== "string" || name.length === 0) return "";
  const segments = name.split("/");
  return segments[segments.length - 1] ?? "";
};

export const decodeFirestoreValue = (value: unknown): unknown => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const typed = value as Record<string, unknown>;

  if ("nullValue" in typed) return null;
  if ("stringValue" in typed) {
    return typeof typed.stringValue === "string" ? typed.stringValue : String(typed.stringValue);
  }
  if ("booleanValue" in typed) return Boolean(typed.booleanValue);
  if ("integerValue" in typed) {
    const parsed = Number(typed.integerValue);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if ("doubleValue" in typed) {
    const parsed = Number(typed.doubleValue);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if ("timestampValue" in typed) {
    const parsed = new Date(String(typed.timestampValue));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if ("referenceValue" in typed) {
    return typeof typed.referenceValue === "string" ? typed.referenceValue : null;
  }
  if ("mapValue" in typed) {
    const map = typed.mapValue as { fields?: unknown } | null;
    return decodeFirestoreFields(map?.fields);
  }
  if ("arrayValue" in typed) {
    const array = typed.arrayValue as { values?: unknown } | null;
    return Array.isArray(array?.values) ? array.values.map(decodeFirestoreValue) : [];
  }

  return null;
};

export const decodeFirestoreFields = (fields: unknown): Record<string, unknown> => {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    result[key] = decodeFirestoreValue(value);
  }
  return result;
};

const shouldRetryStatus = (status: number) => status === 429 || status >= 500;

/** Resolves to a header bag carrying the App Check token, or an empty one. */
const appCheckHeaders = async (): Promise<Record<string, string>> => {
  try {
    const token = await Promise.race([
      getAppCheckToken(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), APP_CHECK_TIMEOUT_MS)),
    ]);
    return token ? { "X-Firebase-AppCheck": token } : {};
  } catch {
    return {};
  }
};

const readErrorDetail = async (response: Response): Promise<string> => {
  try {
    const body = await response.text();
    return body.slice(0, 300);
  } catch {
    return "";
  }
};

const documentsBaseUrl = (): { base: string; apiKey: string } => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY");
  }

  return {
    base: `${FIRESTORE_REST_HOST}/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/documents`,
    apiKey,
  };
};

const buildRunQueryUrl = (parentSegments: string[]): string => {
  const { base, apiKey } = documentsBaseUrl();
  const parent = parentSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const suffix = parent ? `/${parent}` : "";
  return `${base}${suffix}:runQuery?key=${encodeURIComponent(apiKey)}`;
};

// Resolves to null only when the server answered 404, so "this story does not
// exist" stays distinguishable from "we could not reach the server".
export const runProjectedGet = async (
  pathSegments: string[],
  fieldPaths: string[]
): Promise<RestDocument | null> => {
  const { base, apiKey } = documentsBaseUrl();
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const mask = fieldPaths
    .map((fieldPath) => `mask.fieldPaths=${encodeURIComponent(fieldPath)}`)
    .join("&");
  const url = `${base}/${path}?key=${encodeURIComponent(apiKey)}&${mask}`;
  const headers = await appCheckHeaders();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) {
      await delay(RETRY_DELAYS_MS[attempt - 1]);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response: Response;
      try {
        response = await fetch(url, { headers, signal: controller.signal });
      } catch (error) {
        lastError = toError(error);
        continue;
      }

      if (response.status === 404) return null;

      if (!response.ok) {
        const detail = await readErrorDetail(response);
        const httpError = new Error(
          `document read failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`
        );
        if (!shouldRetryStatus(response.status)) throw httpError;
        lastError = httpError;
        continue;
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch (error) {
        lastError = toError(error);
        continue;
      }

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        lastError = new Error("document read returned an unexpected payload shape");
        continue;
      }

      const { name, fields } = payload as { name?: unknown; fields?: unknown };
      return { id: documentIdFromName(name), data: decodeFirestoreFields(fields) };
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("document read failed");
};

// Resolves only when the server delivered the whole result set. Transport
// problems, HTTP errors, unparsable payloads and mid-stream RPC failures all
// reject, so neither a dropped connection nor a half-delivered stream can look
// like an empty or complete collection.
export const runProjectedQuery = async (
  parentSegments: string[],
  structuredQuery: Record<string, unknown>
): Promise<RestDocument[]> => {
  const url = buildRunQueryUrl(parentSegments);
  const body = JSON.stringify({ structuredQuery });
  const headers = { "Content-Type": "application/json", ...(await appCheckHeaders()) };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) {
      await delay(RETRY_DELAYS_MS[attempt - 1]);
    }

    // The deadline covers the body read too: runQuery streams, so a stalled
    // connection hangs while draining the response, not while awaiting headers.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response: Response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers,
          body,
          signal: controller.signal,
        });
      } catch (error) {
        lastError = toError(error);
        continue;
      }

      if (!response.ok) {
        const detail = await readErrorDetail(response);
        const httpError = new Error(
          `runQuery failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`
        );
        if (!shouldRetryStatus(response.status)) throw httpError;
        lastError = httpError;
        continue;
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch (error) {
        lastError = toError(error);
        continue;
      }

      if (!Array.isArray(payload)) {
        lastError = new Error("runQuery returned an unexpected payload shape");
        continue;
      }

      const documents: RestDocument[] = [];
      let streamError: Error | null = null;
      let retryStream = false;

      for (const entry of payload) {
        if (!entry || typeof entry !== "object") {
          streamError = new Error("runQuery returned an unrecognized stream element");
          break;
        }

        const record = entry as Record<string, unknown>;
        const failure = record.error;
        // A stream that breaks after the first frame still carries HTTP 200 and
        // reports the failure as a trailing element of the same array.
        if (failure && typeof failure === "object") {
          const { code, message, status } = failure as {
            code?: unknown;
            message?: unknown;
            status?: unknown;
          };
          const detail = [status, message].filter(Boolean).map(String).join(": ");
          streamError = new Error(`runQuery failed mid-stream${detail ? `: ${detail}` : ""}`);
          retryStream = shouldRetryStatus(Number(code));
          break;
        }

        const document = record.document;
        if (document && typeof document === "object") {
          const { name, fields } = document as { name?: unknown; fields?: unknown };
          documents.push({ id: documentIdFromName(name), data: decodeFirestoreFields(fields) });
          continue;
        }

        if (Object.keys(record).every((key) => PROGRESS_KEYS.has(key))) continue;

        streamError = new Error("runQuery returned an unrecognized stream element");
        break;
      }

      if (streamError) {
        if (!retryStream) throw streamError;
        lastError = streamError;
        continue;
      }

      return documents;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("runQuery failed");
};

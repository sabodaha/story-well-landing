# Opinion Board Backend (Firebase)

This guide explains how to set up the Opinion Board backend using Firebase (Firestore + Cloud Functions + Auth + App Check).

## 1) Create Firebase Project
- Create a project at https://console.firebase.google.com/
- Enable **Firestore** (Production mode is fine; rules are provided in `firestore.rules`).
- Enable **Authentication** → **Google** provider.
- Enable **App Check** → **reCAPTCHA v3** (create a site key).

## 2) Configure Cloud Functions
Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

From the repo root:
```bash
cd functions
npm install
npm run build
```

Set function configuration (replace with your values):
```bash
firebase functions:config:set opinion.admin_emails="admin1@example.com,admin2@example.com"
firebase functions:config:set opinion.allowed_origins="https://dartim-media.com"
firebase functions:config:set opinion.require_app_check="true"
```

These values are read in `functions/src/index.ts`. If you prefer, you can also set environment variables
(`ADMIN_EMAILS`, `ALLOWED_ORIGINS`, `REQUIRE_APP_CHECK`) in your function runtime instead of using `functions:config`.

Deploy:
```bash
firebase deploy --only functions,firestore
```

## 3) Cloudflare Pages Env Vars
Set these in **Cloudflare Pages → Settings → Environment Variables**:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`
- `NEXT_PUBLIC_FEEDBACK_API_BASE_URL` (e.g. `https://us-central1-your-project.cloudfunctions.net/opinionBoard`)

## 4) Admin Moderation Page
Open: `/{locale}/admin/opinions`

Sign in with Google; only whitelisted admin emails can view or moderate submissions.

## 5) Data Model
Firestore collection: `opinions`
- `status`: `pending | approved | rejected`
- `message`, `rating`, `name?`, `storyTitle?`, `locale?`
- `createdAt`, `updatedAt`, `approvedAt`, `rejectedAt`
- `moderatedBy`, `ipHash`, `userAgent`, `source`

## 6) Notes
- Public listing: GET `/opinions`
- Submission: POST `/opinions` (App Check required)
- Moderation: GET `/opinions/pending`, PATCH `/opinions/{id}` (admin only)


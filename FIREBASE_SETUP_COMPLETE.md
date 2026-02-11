# Firebase Opinion Board Configuration - Setup Guide

## ✅ Completed Automatically

1. **Functions Code Updated**: 
   - Modified `functions/src/index.ts` to include `https://dartim-media.com` and `https://www.dartim-media.com` in default allowed origins
   - Functions built and deployed successfully
   - Function URL: `https://opinionboard-lb23erpsaq-uc.a.run.app`

2. **Code Changes**:
   - CORS configuration now defaults to allowing `dartim-media.com` domains
   - Environment variable parsing updated to merge with defaults

## ⚠️ Manual Steps Required

Due to service account permission limitations, the following steps must be completed manually:

### 1. Set Cloud Run Environment Variables

The deployed function needs environment variables set in Cloud Run:

1. Go to: https://console.cloud.google.com/run?project=kidsstoriesapp
2. Find the service: **opinionboard**
3. Click **"Edit & Deploy New Revision"**
4. Go to **"Variables & Secrets"** tab
5. Add these environment variables:
   - **ALLOWED_ORIGINS** = `https://dartim-media.com,https://www.dartim-media.com`
   - **REQUIRE_APP_CHECK** = `true`
   - **ADMIN_EMAILS** = `your-admin@email.com` (replace with actual admin email)
6. Click **"Deploy"**

**Alternative via Firebase Console:**
1. Go to: https://console.firebase.google.com/project/kidsstoriesapp/functions
2. Click on **opinionBoard** function
3. Go to **Configuration** tab
4. Scroll to **Environment variables**
5. Add the variables listed above
6. Click **Save**

### 2. Add Authorized Domain to Firebase Auth

1. Go to: https://console.firebase.google.com/project/kidsstoriesapp/authentication/settings
2. Scroll down to **"Authorized domains"** section
3. Click **"Add domain"**
4. Enter: `dartim-media.com`
5. Click **"Add"**

### 3. Verify App Check Configuration

1. Go to: https://console.firebase.google.com/project/kidsstoriesapp/appcheck
2. Verify that the web app is registered with **reCAPTCHA v3**
3. Verify the site key matches the one in `next.config.ts`:
   - Current site key: `6Ld5zFEsAAAAAMDEbTgdzzLyZJoMxrEQijNuLc7l`
4. If App Check enforcement is enabled for Functions, ensure the domain is allowed

### 4. Update Function URL in Next.js Config (if needed)

The function URL is: `https://opinionboard-lb23erpsaq-uc.a.run.app`

Verify this matches `NEXT_PUBLIC_FEEDBACK_API_BASE_URL` in:
- `next.config.ts` (currently: `https://opinionboard-643688636511.us-central1.run.app`)
- Cloudflare Pages environment variables (if using)

If the URL is different, update both locations.

## Verification Steps

After completing the manual steps:

1. **Test Opinion Submission**:
   - Visit: `https://dartim-media.com/en/feedback`
   - Submit a test opinion
   - Should receive success message (no CORS errors)

2. **Test Admin Moderation**:
   - Visit: `https://dartim-media.com/en/admin/opinions`
   - Sign in with Google (using admin email)
   - Should see pending opinions
   - Approve a test opinion

3. **Test Public Listing**:
   - Visit: `https://dartim-media.com/en/feedback`
   - Approved opinions should appear in the list

## Troubleshooting

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes `https://dartim-media.com`
- Check browser console for exact error message
- Ensure function was redeployed after setting environment variables

### Auth Popup Closes Immediately
- Verify `dartim-media.com` is in Firebase Auth authorized domains
- Check browser console for auth errors

### App Check Errors
- Verify reCAPTCHA v3 site key matches in both Firebase Console and `next.config.ts`
- Check that App Check is properly initialized in `lib/firebase/client.ts`
- If `REQUIRE_APP_CHECK=false`, App Check token is optional

### Function Not Found (404)
- Verify function is deployed: `firebase functions:list`
- Check function URL matches `NEXT_PUBLIC_FEEDBACK_API_BASE_URL`

## Service Account Permissions

The service account used (`firebase-adminsdk-fbsvc@kidsstoriesapp.iam.gserviceaccount.com`) has:
- ✅ Firebase Functions deployment permissions
- ❌ Cloud Run service modification permissions (needs Cloud Run Admin role)

To grant Cloud Run Admin role (optional, for future automation):
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=kidsstoriesapp
2. Find the service account
3. Click **Edit**
4. Add role: **Cloud Run Admin**
5. Save

## Summary

- ✅ Functions code updated and deployed
- ⚠️ Environment variables need to be set manually
- ⚠️ Authorized domain needs to be added manually
- ⚠️ App Check configuration needs verification

After completing the manual steps, the Opinion Board should work correctly from `https://dartim-media.com`.






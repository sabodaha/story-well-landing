# Firebase Admin Panel and Opinion Board Fixes Applied

## ✅ Completed Fixes

### 1. Firestore Rules Updated and Deployed

**File**: `firestore.rules`

**Changes**:
- Added admin access check function: `isAdmin()` checks for `request.auth.token.admin == true`
- **Stories collection**: Now allows read/write for authenticated admin users
- **Config collection**: Allows admin access
- **Opinions collection**: Remains restricted (only via Cloud Functions Admin SDK)
- **User preferences**: Users can access their own data
- **Default**: All other collections denied

**Status**: ✅ Deployed successfully

**Impact**: Admin-panel should now be able to read/write stories collection.

### 2. Error Handling Improved

**File**: `app/[locale]/feedback/page.tsx`

**Changes**:
- Added detailed error messages for different HTTP status codes:
  - 401: Authentication required
  - 403: Access denied
  - 429: Rate limiting
  - 400: Invalid input (with specific field errors)
  - 500+: Server errors
- Added console logging for debugging
- Better error text parsing from API responses

**Status**: ✅ Code updated

**Impact**: Users will see more helpful error messages when opinion submission fails.

### 3. Admin Users Verified

**Verified Admin Users**:
- ✅ `admin@dartim-media.com` (UID: NtpFLCNAY5cIzd9pPb3NCsK240s1)
- ✅ `sabodaha@gmail.com` (UID: gIdnWLU1Pfdalt6pkGO9asHv3dX2)

**Status**: ✅ Both users have `admin: true` custom claim set

## ⚠️ Manual Steps Required

### 1. Set Cloud Run IAM Permissions (CRITICAL)

The opinion board function is returning 403 Forbidden because it's not publicly accessible.

**Option A: Using Google Cloud Console** (Recommended)
1. Go to: https://console.cloud.google.com/run?project=kidsstoriesapp
2. Find service: **opinionboard**
3. Click on the service name
4. Go to **"Permissions"** tab
5. Click **"Add Principal"**
6. Principal: `allUsers`
7. Role: **Cloud Run Invoker**
8. Click **"Save"**

**Option B: Using gcloud CLI**
```bash
# Install gcloud if not installed
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project kidsstoriesapp

# Grant public access
gcloud run services add-iam-policy-binding opinionboard \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

**Status**: ⚠️ **REQUIRED** - Without this, opinion submission will fail with 403 errors.

### 2. Verify Cloud Run Environment Variables

Ensure these are set in the Cloud Run service:

1. Go to: https://console.cloud.google.com/run?project=kidsstoriesapp
2. Find service: **opinionboard**
3. Click on the service name
4. Go to **"Revisions"** tab → Click on latest revision
5. Check **"Variables & Secrets"** section

**Required Variables**:
- `ALLOWED_ORIGINS` = `https://dartim-media.com,https://www.dartim-media.com`
- `REQUIRE_APP_CHECK` = `true`
- `ADMIN_EMAILS` = `admin@dartim-media.com,sabodaha@gmail.com` (or your admin emails)

**Status**: ⚠️ Verify these are set correctly.

## Testing Checklist

After completing manual steps:

### Admin Panel
- [ ] Open admin-panel (wherever it's hosted)
- [ ] Sign in with `admin@dartim-media.com` or `sabodaha@gmail.com`
- [ ] Verify stories list loads (should not show "0 stories")
- [ ] Verify you can view/edit stories

### Opinion Board
- [ ] Visit: `https://dartim-media.com/en/feedback`
- [ ] Fill out opinion form
- [ ] Submit opinion
- [ ] Verify success message appears
- [ ] Check browser console for any errors
- [ ] Verify opinion appears in admin moderation panel

### Admin Moderation
- [ ] Visit: `https://dartim-media.com/en/admin/opinions`
- [ ] Sign in with admin account
- [ ] Verify pending opinions are visible
- [ ] Approve a test opinion
- [ ] Verify approved opinion appears in public list

## Troubleshooting

### Admin Panel Still Shows 0 Stories

**Possible Causes**:
1. User doesn't have admin claim - Verify in Firebase Console → Authentication → Users
2. Firestore rules not deployed - Run: `firebase deploy --only firestore:rules`
3. Browser cache - Clear cache and hard refresh
4. Wrong Firebase project - Verify `config.js` uses `kidsstoriesapp` project

**Fix**:
- Check browser console for Firestore permission errors
- Verify user has `admin: true` custom claim
- Redeploy Firestore rules if needed

### Opinion Submission Fails

**Check Browser Console**:
- Look for specific error messages (now improved)
- Check if App Check token is being sent
- Verify CORS errors (should be fixed)

**Common Issues**:
1. **403 Forbidden**: IAM permissions not set (see manual steps above)
2. **401 Unauthorized**: App Check token missing/invalid
3. **CORS Error**: Check `ALLOWED_ORIGINS` environment variable
4. **400 Bad Request**: Invalid input (check form validation)

**Fix**:
- Set Cloud Run IAM permissions (see manual steps)
- Verify App Check is configured correctly
- Check function logs in Firebase Console

### Function Returns 403

This is the most common issue. The function needs to be publicly accessible:

1. Set IAM permissions (see manual steps above)
2. Verify the function URL is correct: `https://opinionboard-lb23erpsaq-uc.a.run.app`
3. Test with curl:
   ```bash
   curl https://opinionboard-lb23erpsaq-uc.a.run.app/opinions?limit=1
   ```

## Files Modified

1. ✅ `firestore.rules` - Updated to allow admin access
2. ✅ `app/[locale]/feedback/page.tsx` - Improved error handling

## Files Created (Diagnostic Scripts)

1. `verify_and_fix_admin.js` - Checks admin users and tests function
2. `check_function_iam.js` - Checks IAM permissions
3. `set_function_public.js` - Attempts to set public access (requires permissions)

These can be deleted after verification.

## Next Steps

1. **CRITICAL**: Set Cloud Run IAM permissions (see manual steps)
2. Verify environment variables are set
3. Test admin-panel story loading
4. Test opinion submission
5. Clean up diagnostic scripts if desired

## Summary

- ✅ Firestore rules fixed and deployed
- ✅ Error handling improved
- ✅ Admin users verified
- ⚠️ **REQUIRED**: Set Cloud Run IAM permissions manually
- ⚠️ Verify environment variables

Once IAM permissions are set, both admin-panel and opinion board should work correctly.



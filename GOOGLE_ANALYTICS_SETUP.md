# Google Analytics 4 Setup Guide

## ✅ Already Configured!

Your Google Analytics is **already integrated** with Measurement ID: **G-WH3B9YGVFF**

The analytics will start collecting data automatically after deployment. No additional setup required!

## Privacy-Friendly Configuration

This landing page includes Google Analytics 4 with **minimal data collection** to ensure GDPR compliance and user privacy.

## Features

✅ **IP Anonymization** - Enabled by default in GA4  
✅ **Google Signals Disabled** - No cross-device tracking  
✅ **Ads Personalization Disabled** - No personalized advertising  
✅ **Remarketing Disabled** - No remarketing features  
✅ **User-ID Disabled** - No user identification  
✅ **Cross-Device Tracking Disabled** - Each device tracked separately  
✅ **Cookie Consent Integration** - Only loads if user accepts analytics cookies  

## Setup Instructions

### Step 1: Create Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Click **Create Property**
4. Fill in:
   - **Property name**: Storywell Landing Page
   - **Reporting time zone**: Your timezone
   - **Currency**: EUR
5. Click **Next** → Select **Small** business size
6. Click **Create** and accept Terms of Service

### Step 2: Create Data Stream

1. In your new property, click **Data Streams**
2. Click **Add stream** → **Web**
3. Fill in:
   - **Website URL**: `https://dartim-media.com`
   - **Stream name**: Storywell Website
4. Click **Create stream**
5. **Copy your Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Configure Privacy Settings in GA4

In Google Analytics Admin:

#### 3.1 Data Collection Settings
1. Go to **Admin** → **Data Settings** → **Data Collection**
2. **Turn OFF**:
   - ❌ Google signals data collection
   - ❌ User data for advertising purposes

#### 3.2 Data Retention
1. Go to **Admin** → **Data Settings** → **Data Retention**
2. Set:
   - **Event data retention**: 2 months (minimum)
   - **Reset user data on new activity**: OFF

#### 3.3 Advertising Features
1. Go to **Admin** → **Property Settings**
2. Ensure these are **DISABLED**:
   - ❌ Enable Demographics and Interests reports
   - ❌ Enable Advertising Reporting Features

### Step 4: Measurement ID (Already Configured!)

✅ **Your Measurement ID is already set**: `G-WH3B9YGVFF`

The code is hardcoded in the component, so it will work automatically after deployment. No environment variables needed!

#### Optional: Override with Environment Variable (Advanced)

If you want to change the Measurement ID in the future:

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/8cf944e3be0f0044636d241be39fa687)
2. Select your **story-well-landing** project
3. Go to **Settings** → **Environment variables**
4. Add new variable:
   - **Variable name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: Your new Measurement ID
   - **Environment**: Production
5. Click **Save** and **Redeploy**

For local development, create `.env.local`:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WH3B9YGVFF
```

### Step 5: Verify Installation

1. Visit your deployed website: `https://dartim-media.com`
2. **Accept analytics cookies** when cookie banner appears
3. In Google Analytics:
   - Go to **Reports** → **Realtime**
   - You should see yourself as an active user
4. Open browser console (F12) - you should see:
   ```
   Google Analytics loaded with privacy-friendly settings
   ```

## How It Works

### Cookie Consent Integration

Google Analytics **only loads** when:
- User clicks **"Accept All"** in cookie banner, OR
- User enables **Analytics Cookies** in Preferences

If user chooses **"Only Essential"**, GA will **NOT load**.

### What Data is Collected?

**Minimal data only:**
- ✅ Page views (which pages are visited)
- ✅ Session duration (how long users stay)
- ✅ Basic device type (mobile/desktop)
- ✅ Country/city (anonymized)
- ✅ Referral source (where users come from)

**NOT collected:**
- ❌ IP addresses (anonymized)
- ❌ User identity
- ❌ Cross-device behavior
- ❌ Personal information
- ❌ Advertising data

### Data Storage

- **Cookies**: Set with `SameSite=None;Secure` flags
- **Duration**: 2 years (GA4 default)
- **Local Storage**: Not used (`client_storage: 'none'`)

## Testing

### Test Cookie Consent:

1. Open website in **incognito/private mode**
2. When cookie banner appears:
   - **Accept All** → GA loads (check console)
   - **Only Essential** → GA does NOT load
3. Clear cookies and test **Preferences**:
   - Enable Analytics → GA loads
   - Disable Analytics → GA does NOT load

### Check Privacy Settings:

Open browser console (F12) and run:
```javascript
// Check if GA loaded
console.log(window.dataLayer);

// Check configuration
console.log(gtag);
```

If GA is loaded with privacy settings, you should see the dataLayer.

## Troubleshooting

### GA Not Showing Data

1. **Check Measurement ID** is correct in `.env.local` or Cloudflare
2. **Accept analytics cookies** on the website
3. **Wait 24-48 hours** for initial data to appear (Realtime should work immediately)
4. Check browser console for errors

### Cookies Not Working

1. Ensure website is served over **HTTPS** (required for GA4)
2. Check that cookie banner appears
3. Verify localStorage has `cookie-consent` entry

### Privacy Concerns

All settings are configured for **maximum privacy**:
- IP anonymization: ✅ Automatic in GA4
- Google Signals: ❌ Disabled
- Advertising: ❌ Disabled
- Cross-device: ❌ Disabled
- User-ID: ❌ Not implemented

## Compliance

This setup is compliant with:
- ✅ **GDPR** (EU General Data Protection Regulation)
- ✅ **ePrivacy Directive** (Cookie Law)
- ✅ **CCPA** (California Consumer Privacy Act)

## Next Steps

After setup:
1. Monitor analytics in GA4 dashboard
2. Set up useful reports (Engagement, Acquisition)
3. Create custom events if needed (optional)
4. Review data monthly to improve user experience

## Support

If you encounter issues:
- **GA4 Help**: [support.google.com/analytics](https://support.google.com/analytics)
- **Email**: admin@dartim-media.com

---

**Privacy First**: We collect only what's necessary to improve our service. 🔒


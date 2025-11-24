# Deploying Story Well Landing Page to Cloudflare Pages

This guide will walk you through deploying the Story Well landing page to Cloudflare Pages.

## Prerequisites

- ✅ Cloudflare account with access to `dartim-media.com` domain
- ✅ Landing page code (already created in `E:\Projects\myapp\landing-page`)
- ✅ GitHub account (for automatic deployments - recommended)

## Option 1: GitHub Integration (Recommended)

This is the easiest method with automatic deployments on every push.

### Step 1: Create GitHub Repository

```bash
cd E:\Projects\myapp\landing-page
git init
git add .
git commit -m "Initial commit: Story Well landing page"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/story-well-landing.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/8cf944e3be0f0044636d241be39fa687)
2. Click **Workers & Pages** in the left sidebar
3. Click **Create application** → **Pages** → **Connect to Git**
4. Authorize GitHub and select your repository
5. Configure the build:
   - **Project name**: `story-well` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
6. Click **Save and Deploy**

Your site will be deployed to `https://story-well.pages.dev` (or similar).

### Step 3: Add Custom Domain

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain options:
   - `dartim-media.com` (root domain)
   - `www.dartim-media.com` (www subdomain)
   - `stories.dartim-media.com` (custom subdomain)
4. Click **Continue** and **Activate domain**

Since your domain is already managed by Cloudflare, DNS records will be added automatically!

### Step 4: Configure SSL/TLS

Cloudflare automatically provisions SSL certificates. Check that:

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full** or **Full (strict)**
3. SSL certificate should show as **Active**

## Option 2: Direct Upload via Wrangler CLI

For quick deployments without GitHub integration.

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This opens a browser window to authorize.

### Step 3: Build and Deploy

```bash
cd E:\Projects\myapp\landing-page
npm run build
npx wrangler pages deploy out --project-name=story-well
```

On first deployment, you'll be asked to create the project.

### Step 4: Subsequent Deployments

Just run:

```bash
npm run build
npx wrangler pages deploy out --project-name=story-well
```

## Option 3: Manual Upload

For one-time deployments or testing.

### Step 1: Build the Project

```bash
cd E:\Projects\myapp\landing-page
npm run build
```

This creates the `out` folder with your static site.

### Step 2: Upload to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/8cf944e3be0f0044636d241be39fa687)
2. Click **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. Drag and drop the `out` folder (or click to browse)
4. Enter project name: `story-well`
5. Click **Deploy site**

## Post-Deployment Configuration

### Custom Domain Setup

After deployment, configure your custom domain:

1. **Using Root Domain** (`dartim-media.com`):
   ```
   Type: CNAME or ALIAS
   Name: @
   Content: story-well.pages.dev
   ```

2. **Using Subdomain** (`www.dartim-media.com`):
   ```
   Type: CNAME
   Name: www
   Content: story-well.pages.dev
   ```

3. **Using Custom Subdomain** (`app.dartim-media.com`):
   ```
   Type: CNAME
   Name: app
   Content: story-well.pages.dev
   ```

Since your domain is on Cloudflare, these are added automatically when you use the "Custom domains" feature in Pages.

### Email Configuration

Your email (`admin@dartim-media.com`) should continue working as-is. To add email routing:

1. Go to **Email** → **Email Routing** in Cloudflare Dashboard
2. Set up destination addresses
3. Create routing rules as needed

### Analytics (Optional but Recommended)

Enable Cloudflare Web Analytics for privacy-friendly, free analytics:

1. Go to **Analytics** → **Web Analytics**
2. Click **Add a site**
3. Enter your domain
4. Copy the JavaScript snippet
5. Add to `app/layout.tsx`:

```tsx
<Script
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN"}'
  defer
/>
```

### Performance Optimization

Cloudflare Pages automatically provides:
- ✅ Global CDN distribution
- ✅ HTTP/3 and QUIC support
- ✅ Automatic minification
- ✅ Brotli compression
- ✅ Smart routing

Consider enabling:
1. **Auto Minify** (HTML, CSS, JS) - in **Speed** → **Optimization**
2. **Rocket Loader** - in **Speed** → **Optimization** → **Rocket Loader**
3. **Mirage** - Image optimization for mobile

## Environment Variables

If you need environment variables (for API keys, etc.):

1. In Pages project → **Settings** → **Environment variables**
2. Add variables:
   - **Production**: Live site variables
   - **Preview**: For preview deployments

For Next.js, prefix public variables with `NEXT_PUBLIC_`:
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Continuous Deployment

With GitHub integration:

1. **Push to main** → Automatically deploys to production
2. **Push to other branches** → Creates preview deployments
3. **Pull requests** → Automatic preview deployments with unique URLs

Each deployment gets a unique URL like:
```
https://abc123.story-well.pages.dev
```

## Monitoring

Monitor your site:

1. **Analytics** → View traffic and performance
2. **Pages project** → **Deployments** → View all deployment history
3. **Pages project** → **Functions** → View function logs (if using Cloudflare Functions)

## Troubleshooting

### Build Fails

**Error**: "Build command failed"

**Solution**: Check build logs in Cloudflare dashboard. Common issues:
- Missing dependencies: Ensure `package.json` is correct
- Node version: Cloudflare uses Node 18+ by default
- Build command: Verify `npm run build` works locally

### Custom Domain Not Working

**Error**: Domain shows "Not Found" or certificate errors

**Solution**:
1. Verify DNS records are correct (check **DNS** in Cloudflare)
2. Wait 5-10 minutes for DNS propagation
3. Check SSL/TLS mode is set to **Full**
4. Clear browser cache and try in incognito mode

### Images Not Loading

**Error**: Images return 404 or don't display

**Solution**:
- Verify images are in `public` folder
- Check `next.config.ts` has `images: { unoptimized: true }`
- Use relative paths: `/image.png` not `./image.png`

### Build Output Directory Error

**Error**: "Output directory 'out' not found"

**Solution**:
- Ensure `next.config.ts` has `output: 'export'`
- Run `npm run build` locally to verify `out` folder is created
- Check Cloudflare Pages build settings match: **Build output directory**: `out`

## Rolling Back

To rollback to a previous deployment:

1. Go to **Pages project** → **Deployments**
2. Find the working deployment
3. Click **⋯** → **Rollback to this deployment**
4. Confirm rollback

This instantly reverts your site to the selected version.

## Cost

Cloudflare Pages is **FREE** for:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ Unlimited sites
- ✅ 500 builds per month
- ✅ 5,000 functions requests per day (if using Functions)

Perfect for a landing page! 🎉

## Support

If you encounter issues:

1. Check [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
2. Visit [Cloudflare Community](https://community.cloudflare.com/)
3. Contact Cloudflare Support (if on paid plan)

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Run dev server | `npm run dev` |
| Build for production | `npm run build` |
| Deploy with Wrangler | `npx wrangler pages deploy out --project-name=story-well` |
| View production site | Visit your custom domain or Pages URL |

## Next Steps

After deployment:

1. ✅ Test the site on desktop and mobile
2. ✅ Verify all links work correctly
3. ✅ Check SSL certificate is active (🔒 in browser)
4. ✅ Set up analytics to track visitors
5. ✅ Submit to Google Search Console for SEO
6. ✅ Create social media preview cards
7. ✅ Set up monitoring/uptime checks

---

**Your landing page should now be live at `dartim-media.com` or your custom domain!** 🚀

For questions, contact: admin@dartim-media.com


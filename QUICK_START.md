# Quick Start Guide

Get your Story Well landing page live in 5 minutes! ⚡

## 🚀 Fastest Way to Deploy

### Option A: Using GitHub (Recommended)

```bash
# 1. Navigate to the landing page
cd E:\Projects\myapp\landing-page

# 2. Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# 3. Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/story-well-landing.git
git push -u origin main
```

Then:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/8cf944e3be0f0044636d241be39fa687)
2. **Workers & Pages** → **Create** → **Connect to Git**
3. Select your repo
4. **Framework**: Next.js (Static Export)
5. **Build command**: `npm run build`
6. **Output dir**: `out`
7. Click **Deploy**

Done! 🎉

### Option B: Using Wrangler CLI (No GitHub needed)

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Build and deploy
cd E:\Projects\myapp\landing-page
npm run build
npx wrangler pages deploy out --project-name=story-well
```

Done! 🎉

## 🌐 Add Your Custom Domain

After deployment:

1. In Pages project → **Custom domains** → **Set up a custom domain**
2. Enter: `dartim-media.com`
3. Click **Activate**

DNS is configured automatically since your domain is on Cloudflare!

## 🧪 Test Locally First

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Checklist

Before going live:

- [ ] Test all links work
- [ ] Check mobile responsiveness
- [ ] Verify contact email is correct
- [ ] Test on different browsers
- [ ] Update download links when app is available

## 🆘 Need Help?

- **Full deployment guide**: See `DEPLOYMENT.md`
- **Customization**: See `README.md`
- **Email**: admin@dartim-media.com

---

That's it! Your landing page should be live in minutes. 🚀


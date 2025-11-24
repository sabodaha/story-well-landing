# Story Well Landing Page

A beautiful, modern landing page for Story Well - a multilingual children's story reading app.

## 🎨 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

## 🚀 Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## 📦 Deployment to Cloudflare Pages

### Method 1: GitHub Integration (Recommended)

1. Push this code to a GitHub repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Navigate to **Workers & Pages** → **Create application** → **Pages**
4. Connect your GitHub account and select the repository
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `landing-page` (if in monorepo)
6. Click **Save and Deploy**

### Method 2: Direct Upload (Wrangler CLI)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=story-well
```

### Method 3: Manual Deployment

1. Build the project: `npm run build`
2. Go to Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. Upload the `.next` folder

## 🌐 Custom Domain Setup

After deployment, configure your custom domain:

1. In Cloudflare Dashboard, go to your **Pages project**
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter `dartim-media.com` (or preferred subdomain)
5. Follow the DNS configuration instructions

Since your domain is already on Cloudflare, the DNS records will be added automatically.

## 📝 Environment Variables

This landing page doesn't require any environment variables by default. If you add features that need them:

1. In Cloudflare Dashboard → Your Pages project → **Settings** → **Environment variables**
2. Add your variables for Production and Preview environments

## 🎨 Customization

### Colors

The landing page uses a purple-pink gradient theme matching Story Well's branding. To customize:

- Primary colors are in `app/page.tsx`
- Global styles in `app/globals.css`
- Tailwind config in `tailwind.config.ts`

### Content

All content is in `app/page.tsx`. Key sections:

- **Hero**: Main headline and CTA
- **Features**: App features grid
- **Benefits**: Why parents love it
- **Languages**: 8 supported languages
- **FAQ**: Common questions
- **Footer**: Contact and links

### Adding New Sections

```tsx
<section className="py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    {/* Your content */}
  </div>
</section>
```

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript configuration

## 📱 Responsive Design

The landing page is fully responsive:

- **Mobile**: Single column, stacked sections
- **Tablet**: Two columns for features
- **Desktop**: Full multi-column layout

## 🎭 Animations

Framer Motion is installed for adding smooth animations. Example:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

## 🌐 SEO

The landing page includes:

- ✅ Meta tags for SEO
- ✅ Open Graph tags for social sharing
- ✅ Semantic HTML structure
- ✅ Fast loading times
- ✅ Mobile-friendly design

Consider adding:

- `robots.txt` file
- `sitemap.xml` file
- Schema.org structured data
- Analytics integration

## 📊 Analytics (Optional)

To add analytics:

### Google Analytics

```tsx
// Add to app/layout.tsx
import Script from 'next/script'

<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

### Cloudflare Web Analytics (Recommended)

1. In Cloudflare Dashboard → **Analytics** → **Web Analytics**
2. Create a new site
3. Copy the script tag
4. Add to `app/layout.tsx`

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Styling Issues

```bash
# Regenerate Tailwind
npx tailwindcss -i ./app/globals.css -o ./app/output.css
```

### Port Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

## 📞 Support

For questions or issues:

- **Email**: admin@dartim-media.com
- **Domain**: dartim-media.com (Cloudflare)

## 📄 License

This landing page is part of the Story Well project.

---

Made with ❤️ for Story Well

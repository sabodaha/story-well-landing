import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';

export const dynamic = 'force-static';

const baseUrl = 'https://dartim-media.com';

// Routes that exist for each locale
const localeRoutes = [
  '',           // Home page
  '/stories',   // Read online
  '/sleep',     // Sleep music
  '/feedback',  // Feedback page
  '/reviews',   // Reviews page
  '/privacy',    // Privacy policy
  '/terms',      // Terms of service
  '/impressum',  // Legal notice (Impressum)
];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  // Add root URL
  urls.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1.0,
  });

  // Universal download redirect
  urls.push({
    url: `${baseUrl}/download`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  });

  // Add all locale-specific routes
  for (const locale of locales) {
    for (const route of localeRoutes) {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  return urls;
}


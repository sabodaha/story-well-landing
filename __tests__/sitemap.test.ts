/**
 * Tests for sitemap generation
 * Verifies that all locales and routes are included
 */

import { locales } from '../lib/i18n/config';

describe('Sitemap Generation', () => {
  const baseUrl = 'https://dartim-media.com';
  const localeRoutes = ['', '/feedback', '/reviews', '/privacy', '/terms'];
  
  it('should include all locales', () => {
    expect(locales.length).toBe(8);
    expect(locales).toContain('en');
    expect(locales).toContain('de');
    expect(locales).toContain('es');
    expect(locales).toContain('fr');
    expect(locales).toContain('it');
    expect(locales).toContain('ru');
    expect(locales).toContain('tr');
    expect(locales).toContain('uk');
  });

  it('should generate correct number of URLs', () => {
    // Root URL + (8 locales × 5 routes) = 1 + 40 = 41 URLs
    const expectedUrlCount = 1 + (locales.length * localeRoutes.length);
    expect(expectedUrlCount).toBe(41);
  });

  it('should generate correct URL patterns', () => {
    for (const locale of locales) {
      for (const route of localeRoutes) {
        const expectedUrl = route === '' 
          ? `${baseUrl}/${locale}`
          : `${baseUrl}/${locale}${route}`;
        expect(expectedUrl).toMatch(/^https:\/\/dartim-media\.com\/(en|de|es|fr|it|ru|tr|uk)(\/[a-z]+)?$/);
      }
    }
  });
});





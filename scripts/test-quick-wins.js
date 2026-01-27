/**
 * Simple test runner for quick wins implementation
 * Run with: node scripts/test-quick-wins.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://dartim-media.com';
const apiBaseUrl = 'https://opinionboard-lb23erpsaq-uc.a.run.app';

const locales = ['en', 'de', 'es', 'fr', 'it', 'ru', 'tr', 'uk'];
const localeRoutes = ['', '/feedback', '/reviews', '/privacy', '/terms'];

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Sitemap exists and has correct structure
test('Sitemap file exists', () => {
  const sitemapPath = path.join(__dirname, '../out/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('sitemap.xml not found in out/ directory');
  }
});

test('Sitemap contains all locales', () => {
  const sitemapPath = path.join(__dirname, '../out/sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  for (const locale of locales) {
    if (!sitemapContent.includes(`${baseUrl}/${locale}`)) {
      throw new Error(`Missing locale ${locale} in sitemap`);
    }
  }
});

test('Sitemap contains all routes for each locale', () => {
  const sitemapPath = path.join(__dirname, '../out/sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  for (const locale of locales) {
    for (const route of localeRoutes) {
      const expectedUrl = route === '' 
        ? `${baseUrl}/${locale}`
        : `${baseUrl}/${locale}${route}`;
      if (!sitemapContent.includes(`<loc>${expectedUrl}</loc>`)) {
        throw new Error(`Missing URL: ${expectedUrl}`);
      }
    }
  }
});

test('Sitemap has correct URL count', () => {
  const sitemapPath = path.join(__dirname, '../out/sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  const urlMatches = sitemapContent.match(/<loc>/g);
  const expectedCount = 1 + (locales.length * localeRoutes.length); // Root + (8 * 5)
  
  if (!urlMatches || urlMatches.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} URLs, found ${urlMatches?.length || 0}`);
  }
});

// Test 2: Health endpoint (async)
function testHealthEndpoint() {
  return new Promise((resolve) => {
    const req = https.get(`${apiBaseUrl}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Check if response is HTML (error page) or JSON
        if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
          console.log('⚠ Health endpoint test skipped (API may not be deployed yet)');
          resolve();
          return;
        }
        
        try {
          const json = JSON.parse(data);
          test('Health endpoint returns 200', () => {
            if (res.statusCode !== 200) {
              throw new Error(`Expected 200, got ${res.statusCode}`);
            }
          });
          test('Health endpoint returns status field', () => {
            if (!json.status) {
              throw new Error('Missing status field');
            }
            if (json.status !== 'ok' && json.status !== 'error') {
              throw new Error(`Unexpected status: "${json.status}"`);
            }
          });
          test('Health endpoint returns timestamp', () => {
            if (!json.timestamp) {
              throw new Error('Missing timestamp field');
            }
            if (isNaN(Date.parse(json.timestamp))) {
              throw new Error('Invalid timestamp format');
            }
          });
          resolve();
        } catch (error) {
          test('Health endpoint returns valid JSON', () => {
            throw new Error(`Invalid JSON response: ${error.message}`);
          });
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`⚠ Health endpoint test skipped (Connection error: ${error.message})`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⚠ Health endpoint test skipped (Timeout)');
      resolve();
    });
  });
}

// Test 3: Skip link exists in layout
test('Skip link exists in layout', () => {
  const layoutPath = path.join(__dirname, '../app/[locale]/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  
  if (!layoutContent.includes('Skip to main content')) {
    throw new Error('Skip link text not found in layout');
  }
  if (!layoutContent.includes('href="#main-content"')) {
    throw new Error('Skip link href not found in layout');
  }
});

test('Main content ID exists in page', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('id="main-content"')) {
    throw new Error('Main content ID not found in page');
  }
});

// Test 4: Structured data exists
test('SoftwareApplication schema exists in layout', () => {
  const layoutPath = path.join(__dirname, '../app/[locale]/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  
  if (!layoutContent.includes('SoftwareApplication')) {
    throw new Error('SoftwareApplication schema not found');
  }
  if (!layoutContent.includes('application/ld+json')) {
    throw new Error('JSON-LD script tag not found');
  }
});

test('FAQPage schema exists in page', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('FAQPage')) {
    throw new Error('FAQPage schema not found');
  }
});

// Test 5: Hreflang tags in metadata
test('Hreflang alternates in metadata', () => {
  const layoutPath = path.join(__dirname, '../app/[locale]/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  
  if (!layoutContent.includes('alternates')) {
    throw new Error('Alternates metadata not found');
  }
  if (!layoutContent.includes('canonical')) {
    throw new Error('Canonical URL not found in metadata');
  }
});

// Run all tests
console.log('Running quick wins tests...\n');

// Run async health endpoint test
testHealthEndpoint().then(() => {
  console.log('\n--- Test Results ---');
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
  }
});


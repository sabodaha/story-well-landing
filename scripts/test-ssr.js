/**
 * Test SSR implementation
 * Verifies that the page is server-side rendered
 */

const fs = require('fs');
const path = require('path');

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

console.log('Testing SSR implementation...\n');

// Test 1: Page is not a client component
test('Page does not have "use client" directive', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (pageContent.includes("'use client'")) {
    throw new Error('Page still has "use client" directive');
  }
});

// Test 2: Server-side content fetching exists
test('Server-side content fetching function exists', () => {
  const serverContentPath = path.join(__dirname, '../lib/content/server.ts');
  if (!fs.existsSync(serverContentPath)) {
    throw new Error('Server-side content file not found');
  }
  
  const content = fs.readFileSync(serverContentPath, 'utf-8');
  if (!content.includes('getSiteContent')) {
    throw new Error('getSiteContent function not found in server.ts');
  }
});

// Test 3: Server-side translations exist
test('Server-side translations function exists', () => {
  const serverI18nPath = path.join(__dirname, '../lib/i18n/server.ts');
  if (!fs.existsSync(serverI18nPath)) {
    throw new Error('Server-side i18n file not found');
  }
  
  const content = fs.readFileSync(serverI18nPath, 'utf-8');
  if (!content.includes('getTranslations')) {
    throw new Error('getTranslations function not found in server.ts');
  }
});

// Test 4: Page uses server-side functions
test('Page uses getTranslations from server', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('getTranslations')) {
    throw new Error('Page does not use getTranslations');
  }
  if (pageContent.includes('useTranslations')) {
    throw new Error('Page still uses client-side useTranslations hook');
  }
});

test('Page uses getSiteContent from server', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('getSiteContent')) {
    throw new Error('Page does not use getSiteContent');
  }
  if (!pageContent.includes('from "@/lib/content/server"')) {
    throw new Error('Page does not import from server.ts');
  }
});

// Test 5: Page is async
test('Page component is async', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('export default async function Home')) {
    throw new Error('Page component is not async');
  }
});

// Test 6: No useState or useEffect
test('Page does not use client-side hooks', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (pageContent.includes('useState')) {
    throw new Error('Page still uses useState');
  }
  if (pageContent.includes('useEffect')) {
    throw new Error('Page still uses useEffect');
  }
  if (pageContent.includes('useParams')) {
    throw new Error('Page still uses useParams');
  }
});

// Test 7: FAQ section is client component
test('FAQ section is properly separated as client component', () => {
  const faqPath = path.join(__dirname, '../components/faq-section.tsx');
  if (!fs.existsSync(faqPath)) {
    throw new Error('FAQ section component not found');
  }
  
  const faqContent = fs.readFileSync(faqPath, 'utf-8');
  if (!faqContent.includes("'use client'")) {
    throw new Error('FAQ section is not marked as client component');
  }
});

console.log('\n--- Test Results ---');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All SSR tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}


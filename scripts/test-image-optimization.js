/**
 * Test image optimization implementation
 * Verifies that images use Next.js Image component
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

console.log('Testing image optimization...\n');

// Test 1: Image component is imported
test('Next.js Image component is imported', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('import Image from "next/image"')) {
    throw new Error('Image component not imported from next/image');
  }
});

// Test 2: No raw img tags in page
test('No raw <img> tags in main page', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  // Check for <img (not in comments or strings)
  const imgTagMatches = pageContent.match(/<img\s/g);
  if (imgTagMatches && imgTagMatches.length > 0) {
    throw new Error(`Found ${imgTagMatches.length} raw <img> tag(s). Should use Image component instead.`);
  }
});

// Test 3: Image component is used
test('Image component is used for hero image', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('<Image')) {
    throw new Error('Image component not used in page');
  }
});

// Test 4: Image has proper attributes
test('Image component has required attributes', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('fill')) {
    throw new Error('Image component missing fill attribute');
  }
  if (!pageContent.includes('priority')) {
    throw new Error('Image component missing priority attribute for above-the-fold image');
  }
  if (!pageContent.includes('sizes=')) {
    throw new Error('Image component missing sizes attribute for responsive loading');
  }
  if (!pageContent.includes('alt=')) {
    throw new Error('Image component missing alt attribute for accessibility');
  }
});

// Test 5: Next config has remote patterns
test('Next.js config allows remote images', () => {
  const configPath = path.join(__dirname, '../next.config.ts');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  
  if (!configContent.includes('remotePatterns')) {
    throw new Error('Next.js config missing remotePatterns for external images');
  }
});

// Test 6: Image uses object-cover class
test('Image has proper styling class', () => {
  const pagePath = path.join(__dirname, '../app/[locale]/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (!pageContent.includes('object-cover')) {
    throw new Error('Image component missing object-cover class');
  }
});

console.log('\n--- Test Results ---');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All image optimization tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}


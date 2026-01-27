/**
 * Test security headers implementation
 * Verifies that security headers are properly configured
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

console.log('Testing security headers...\n');

// Test 1: _headers file exists in public directory
test('_headers file exists in public directory', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  if (!fs.existsSync(headersPath)) {
    throw new Error('_headers file not found in public directory');
  }
});

// Test 2: _headers file was copied to out directory
test('_headers file was copied to out directory', () => {
  const headersPath = path.join(__dirname, '../out/_headers');
  if (!fs.existsSync(headersPath)) {
    throw new Error('_headers file not found in out directory (not copied during build)');
  }
});

// Test 3: Content-Security-Policy header exists
test('Content-Security-Policy header is configured', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('Content-Security-Policy:')) {
    throw new Error('Content-Security-Policy header not found');
  }
});

// Test 4: X-Frame-Options header exists
test('X-Frame-Options header is configured', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('X-Frame-Options: DENY')) {
    throw new Error('X-Frame-Options header not found or not set to DENY');
  }
});

// Test 5: CSP allows Google Analytics
test('CSP allows Google Analytics domains', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('www.googletagmanager.com')) {
    throw new Error('CSP does not allow Google Tag Manager');
  }
  if (!headersContent.includes('www.google-analytics.com')) {
    throw new Error('CSP does not allow Google Analytics');
  }
});

// Test 6: CSP allows Firebase services
test('CSP allows Firebase services', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('*.firebaseapp.com')) {
    throw new Error('CSP does not allow Firebase App');
  }
  if (!headersContent.includes('*.firebasestorage.app')) {
    throw new Error('CSP does not allow Firebase Storage');
  }
});

// Test 7: CSP allows API endpoint
test('CSP allows API endpoint', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('opinionboard-lb23erpsaq-uc.a.run.app')) {
    throw new Error('CSP does not allow API endpoint');
  }
});

// Test 8: CSP allows inline scripts (for JSON-LD)
test('CSP allows inline scripts for structured data', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes("'unsafe-inline'")) {
    throw new Error('CSP does not allow inline scripts (needed for JSON-LD)');
  }
});

// Test 9: X-Content-Type-Options header exists
test('X-Content-Type-Options header is configured', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('X-Content-Type-Options: nosniff')) {
    throw new Error('X-Content-Type-Options header not found or not set to nosniff');
  }
});

// Test 10: Referrer-Policy header exists
test('Referrer-Policy header is configured', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('Referrer-Policy:')) {
    throw new Error('Referrer-Policy header not found');
  }
});

// Test 11: Permissions-Policy header exists
test('Permissions-Policy header is configured', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('Permissions-Policy:')) {
    throw new Error('Permissions-Policy header not found');
  }
});

// Test 12: Strict-Transport-Security header exists
test('Strict-Transport-Security header is configured', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('Strict-Transport-Security:')) {
    throw new Error('Strict-Transport-Security header not found');
  }
});

// Test 13: CSP blocks object-src
test('CSP blocks object-src (security best practice)', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('object-src \'none\'')) {
    throw new Error('CSP does not block object-src');
  }
});

// Test 14: CSP has frame-ancestors
test('CSP has frame-ancestors set to none', () => {
  const headersPath = path.join(__dirname, '../public/_headers');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  
  if (!headersContent.includes('frame-ancestors \'none\'')) {
    throw new Error('CSP frame-ancestors not set to none');
  }
});

console.log('\n--- Test Results ---');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All security headers tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}


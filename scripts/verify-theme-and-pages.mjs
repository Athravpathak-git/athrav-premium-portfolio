// scripts/verify-theme-and-pages.mjs
import http from 'http';

const BASE_URL = 'http://localhost:4280';

const PAGES = [
  '/',
  '/about',
  '/education',
  '/skills',
  '/projects',
  '/projects/omnimind-ai',
  '/certifications',
  '/certifications/coursera-machine-learning-specialization',
  '/experience',
  '/achievements',
  '/services',
  '/contact',
  '/admin/login',
];

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data, headers: res.headers });
      });
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  console.log('--- STARTING COMPREHENSIVE THEME & PAGE VERIFICATION ---');
  let failures = 0;

  for (const page of PAGES) {
    try {
      const res = await fetchPage(page);
      if (res.statusCode !== 200) {
        console.error(`❌ [FAIL] ${page} returned HTTP status ${res.statusCode}`);
        failures++;
        continue;
      }

      // Check for theme initializer
      const hasThemeInitializer = res.body.includes('theme-initializer') && res.body.includes('athrav_theme');
      if (!hasThemeInitializer) {
        console.error(`❌ [FAIL] ${page} is missing inline theme initializer script`);
        failures++;
        continue;
      }

      // Check for dark mode class definitions in body
      const hasDarkBody = res.body.includes('dark:bg-charcoal-900') && res.body.includes('dark:text-cream');
      if (!hasDarkBody) {
        console.error(`❌ [FAIL] ${page} body is missing dark mode background/text classes`);
        failures++;
        continue;
      }

      console.log(`✅ [PASS] ${page} (HTTP ${res.statusCode}, theme-initializer verified, dark styles present)`);
    } catch (err) {
      console.error(`❌ [EXCEPTION] ${page}:`, err.message);
      failures++;
    }
  }

  // Also verify 404 page
  try {
    const res = await fetchPage('/some-non-existent-route-for-testing-404');
    if (res.statusCode === 404) {
      const hasDarkNotFound = res.body.includes('dark:bg-charcoal-900');
      if (hasDarkNotFound) {
        console.log(`✅ [PASS] /_not-found (HTTP 404 handled cleanly with dark mode classes)`);
      } else {
        console.error(`❌ [FAIL] /_not-found missing dark mode classes`);
        failures++;
      }
    } else {
      console.error(`❌ [FAIL] Non-existent route returned HTTP ${res.statusCode}`);
      failures++;
    }
  } catch (err) {
    console.error(`❌ [EXCEPTION] 404 test:`, err.message);
    failures++;
  }

  console.log('---------------------------------------------------------');
  if (failures === 0) {
    console.log('🎉 ALL 14 ROUTE TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error(`💥 ${failures} verification checks failed.`);
    process.exit(1);
  }
}

run();

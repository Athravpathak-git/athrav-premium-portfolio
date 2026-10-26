const http = require('http');

async function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4280,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function post(path, bodyObj, headers = {}) {
  const json = JSON.stringify(bodyObj);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4280,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(json),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    req.write(json);
    req.end();
  });
}

async function runVerification() {
  console.log('--- STARTING VERIFICATION FOR ATHRAV-PREMIUM-PORTFOLIO REDESIGN ---');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Homepage
  const home = await get('/');
  assert(home.statusCode === 200, 'Homepage returns HTTP 200');
  assert(home.body.includes('ATHRAV PATHAK'), 'Homepage includes ATHRAV PATHAK wordmark');
  assert(home.body.includes('CREATIVE DEVELOPER') && home.body.includes('AI &amp; MACHINE LEARNING'), 'Homepage includes small introductory label');
  assert(home.body.includes('Building ideas into'), 'Homepage includes headline part 1');
  assert(home.body.includes('thoughtful digital experiences.'), 'Homepage includes headline part 2 (highlighted)');
  assert(home.body.includes('Explore Projects'), 'Homepage includes primary button "Explore Projects"');
  assert(home.body.includes('Get in Touch'), 'Homepage includes secondary button "Get in Touch"');
  assert(home.body.includes('Featured Projects'), 'Homepage includes Featured Projects section');

  // 2. About page & Real Profile Photo
  const about = await get('/about');
  assert(about.statusCode === 200, 'About page returns HTTP 200');
  assert(about.body.includes('About Athrav Pathak'), 'About page includes title');
  assert(about.body.includes('profile-1793013930445-d7f4837227f112de8d472f17.png'), 'About page references real profile photo');

  // 3. Profile photo stream
  const photo = await get('/uploads/profile-1793013930445-d7f4837227f112de8d472f17.png');
  assert(photo.statusCode === 200, 'Real profile photo returns HTTP 200');
  assert(photo.headers['content-type'] === 'image/png', 'Profile photo returns image/png MIME');
  const photoLength = parseInt(photo.headers['content-length'] || '0', 10);
  assert(photoLength > 1000000, `Profile photo file size is realistic (${photoLength} bytes)`);

  // 4. Other Public Pages
  const pages = [
    '/projects',
    '/projects/omnimind-ai',
    '/education',
    '/skills',
    '/certifications',
    '/experience',
    '/achievements',
    '/services',
    '/contact',
  ];

  for (const page of pages) {
    const res = await get(page);
    assert(res.statusCode === 200, `Public route ${page} returns HTTP 200`);
  }

  // 5. Admin Login & Protected Session
  const loginRes = await post('/api/auth/login', {
    identifier: 'athrav_admin',
    password: 'ReplaceWithStrongPassword123!',
  });
  assert(loginRes.statusCode === 200, 'Admin login API returns HTTP 200');
  const setCookie = loginRes.headers['set-cookie'];
  assert(setCookie && setCookie.length > 0, 'Admin login returns session cookie');

  const cookieHeader = Array.isArray(setCookie) ? setCookie.map(c => c.split(';')[0]).join('; ') : setCookie;

  // 6. Authenticated /api/auth/me
  const meRes = await get('/api/auth/me', { Cookie: cookieHeader });
  assert(meRes.statusCode === 200, 'Authenticated /api/auth/me returns HTTP 200');
  const meData = JSON.parse(meRes.body);
  assert(meData.authenticated === true, 'Session is authenticated');
  assert(meData.user && meData.user.username === 'athrav_admin', 'Authenticated user is athrav_admin');

  // 7. Authenticated /admin
  const adminPage = await get('/admin', { Cookie: cookieHeader });
  assert(adminPage.statusCode === 200, 'Authenticated /admin dashboard returns HTTP 200');
  assert(adminPage.body.includes('Executive Control Overview'), 'Admin dashboard includes Executive Control Overview');

  // 8. Authenticated /admin/profile
  const adminProfile = await get('/admin/profile', { Cookie: cookieHeader });
  assert(adminProfile.statusCode === 200, 'Authenticated /admin/profile returns HTTP 200');
  assert(adminProfile.body.includes('Profile') && adminProfile.body.includes('ATHRAV PORTFOLIO'), 'Admin profile page rendered correctly with sidebar and profile controls');

  console.log(`\n--- VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

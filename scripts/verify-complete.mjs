// scripts/verify-complete.mjs
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4280';

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let body = '';
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return {
      name,
      status: res.status,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries()),
      body,
    };
  } catch (err) {
    return { name, error: err.message, status: 0, ok: false };
  }
}

async function runCompleteVerification() {
  console.log('================================================================');
  console.log('   ATHRAV PATHAK PORTFOLIO — COMPLETE LIVE VERIFICATION SUITE   ');
  console.log('   Target: ' + BASE_URL);
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 1. PUBLIC ROUTES
  // -------------------------------------------------------------------------
  console.log('--- 1. Testing Public Routes ---');
  const publicRoutes = [
    '/',
    '/about',
    '/education',
    '/skills',
    '/projects',
    '/certifications',
    '/experience',
    '/achievements',
    '/services',
    '/contact',
  ];

  for (const r of publicRoutes) {
    const res = await testEndpoint(`Public ${r}`, `${BASE_URL}${r}`);
    assert(res.ok && res.status === 200, `Public route ${r} returned HTTP 200 OK`);
  }

  // Test 404
  const res404 = await testEndpoint('404 Route', `${BASE_URL}/non-existent-route-for-testing`);
  assert(res404.status === 404, 'Non-existent route returned HTTP 404 Not Found');

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATION & LOGIN
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing Authentication & Session Cookie ---');
  const loginRes = await testEndpoint('Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'athrav_admin',
      password: 'ReplaceWithStrongPassword123!',
    }),
  });

  assert(loginRes.status === 200, 'Admin login succeeded with HTTP 200 OK');
  const setCookie = loginRes.headers['set-cookie'];
  assert(Boolean(setCookie), 'Set-Cookie header received from /api/auth/login');

  const match = setCookie ? setCookie.match(/athrav_admin_session=([^;]+)/) : null;
  assert(Boolean(match), 'athrav_admin_session cookie extracted');
  const sessionCookie = `athrav_admin_session=${match[1]}`;

  // Verify /api/auth/me
  const meRes = await testEndpoint('Auth Me', `${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  assert(meRes.body.authenticated === true, '/api/auth/me confirms authenticated === true');
  assert(meRes.body.user?.username === 'athrav_admin', 'Authenticated user is athrav_admin');

  // -------------------------------------------------------------------------
  // 3. ADMIN ENDPOINTS NAVIGATION (NO HANGING OR INDEFINITE LOADING)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Testing All Admin Endpoints (Navigation & Load Verification) ---');
  const adminEndpoints = [
    '/api/admin/profile',
    '/api/admin/homepage',
    '/api/admin/education',
    '/api/admin/skills',
    '/api/admin/projects',
    '/api/admin/certifications',
    '/api/admin/experience',
    '/api/admin/achievements',
    '/api/admin/services',
    '/api/admin/media',
    '/api/admin/messages',
    '/api/admin/users',
    '/api/admin/analytics',
    '/api/admin/security-logs',
    '/api/admin/settings',
  ];

  for (const ep of adminEndpoints) {
    const t0 = Date.now();
    const res = await testEndpoint(`Admin Endpoint ${ep}`, `${BASE_URL}${ep}`, {
      headers: { Cookie: sessionCookie },
    });
    const duration = Date.now() - t0;
    assert(
      res.status === 200,
      `${ep.padEnd(28)} => HTTP 200 OK (${duration}ms - No hanging)`
    );
  }

  // -------------------------------------------------------------------------
  // 4. PROFILE PHOTO UPLOAD, VALIDATION, DISPLAY & PERSISTENCE
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Testing Profile Photo Workflow ---');

  // A. Disguised/Malicious File Rejection (e.g. HTML renamed to .png)
  const fakePngBuffer = Buffer.from('<html><script>alert("exploit")</script></html>');
  const fakeForm = new FormData();
  fakeForm.append(
    'file',
    new Blob([fakePngBuffer], { type: 'image/png' }),
    'disguised_script.png'
  );

  const fakeUploadRes = await testEndpoint('Upload Disguised File', `${BASE_URL}/api/admin/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: fakeForm,
  });
  assert(
    fakeUploadRes.status === 400,
    `Disguised file correctly rejected with HTTP 400 (Got: ${fakeUploadRes.body.error})`
  );

  // B. Genuine PNG Photo Upload with Valid Magic Bytes
  // PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A followed by IHDR chunk
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0xf3, 0xff,
    0x61, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  const realForm = new FormData();
  realForm.append(
    'file',
    new Blob([validPngBuffer], { type: 'image/png' }),
    'athrav_verified_portrait.png'
  );

  const uploadRes = await testEndpoint('Upload Genuine Photo', `${BASE_URL}/api/admin/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: realForm,
  });

  assert(uploadRes.status === 200, 'Genuine photo uploaded with HTTP 200 OK');
  assert(uploadRes.body.success === true, 'Upload response indicates success === true');
  const uploadedAvatarUrl = uploadRes.body.avatarUrl;
  assert(
    uploadedAvatarUrl && uploadedAvatarUrl.startsWith('/uploads/profile-'),
    `avatarUrl has expected format: ${uploadedAvatarUrl}`
  );

  // C. Verify File Exists on Disk
  const diskFilePath = path.join(process.cwd(), 'public', uploadedAvatarUrl.replace(/^\//, ''));
  assert(fs.existsSync(diskFilePath), `Uploaded photo actually exists on disk at ${diskFilePath}`);

  // D. Verify Profile API reflects the updated avatarUrl
  const profileAfterUpload = await testEndpoint('Get Profile After Upload', `${BASE_URL}/api/admin/profile`, {
    headers: { Cookie: sessionCookie },
  });
  assert(
    profileAfterUpload.body.profile?.avatarUrl === uploadedAvatarUrl,
    `Profile API returns avatarUrl === "${uploadedAvatarUrl}"`
  );

  // E. Verify Display on Public About Page
  const aboutPageRes = await testEndpoint('Get Public About Page', `${BASE_URL}/about`);
  assert(
    aboutPageRes.body.includes(uploadedAvatarUrl),
    `Public About page HTML contains the uploaded avatarUrl: ${uploadedAvatarUrl}`
  );

  // F. Replace Photo with Another Image (JPEG Magic Bytes: FF D8 FF E0 ...)
  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0xff, 0xd9,
  ]);

  const replaceForm = new FormData();
  replaceForm.append(
    'file',
    new Blob([validJpegBuffer], { type: 'image/jpeg' }),
    'athrav_second_portrait.jpg'
  );

  const replaceRes = await testEndpoint('Replace Photo', `${BASE_URL}/api/admin/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: replaceForm,
  });

  assert(replaceRes.status === 200, 'Replace photo succeeded with HTTP 200 OK');
  const replacedAvatarUrl = replaceRes.body.avatarUrl;
  assert(
    replacedAvatarUrl && replacedAvatarUrl !== uploadedAvatarUrl,
    `Replaced photo got new URL: ${replacedAvatarUrl}`
  );

  // G. Remove Photo
  const removeRes = await testEndpoint('Remove Photo', `${BASE_URL}/api/admin/profile/avatar`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  assert(removeRes.status === 200, 'Remove photo succeeded with HTTP 200 OK');
  assert(removeRes.body.avatarUrl === null, 'Profile avatarUrl is now null');

  const profileAfterRemove = await testEndpoint('Get Profile After Remove', `${BASE_URL}/api/admin/profile`, {
    headers: { Cookie: sessionCookie },
  });
  assert(
    profileAfterRemove.body.profile?.avatarUrl === null,
    'Profile API confirms avatarUrl === null'
  );

  // H. Verify Fallback Restored on Public About Page
  const aboutPageAfterRemove = await testEndpoint('Get Public About Page After Remove', `${BASE_URL}/about`);
  assert(
    !aboutPageAfterRemove.body.includes(replacedAvatarUrl),
    'Removed photo URL no longer present on About page'
  );
  assert(
    aboutPageAfterRemove.body.includes('Default Avatar') || aboutPageAfterRemove.body.includes('BCA Undergraduate'),
    'Stylized fallback container successfully displayed on About page'
  );

  // Clean up any remaining replaced file
  if (replacedAvatarUrl) {
    const diskPath = path.join(process.cwd(), 'public', replacedAvatarUrl.replace(/^\//, ''));
    if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
  }

  // -------------------------------------------------------------------------
  // 5. LOGOUT
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Testing Logout ---');
  const logoutRes = await testEndpoint('Logout', `${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.status === 200, 'Logout succeeded with HTTP 200 OK');

  const meAfterLogout = await testEndpoint('Auth Me After Logout', `${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  assert(meAfterLogout.body.authenticated === false, 'Session is invalidated');

  console.log('\n================================================================');
  console.log(`   ALL VERIFICATIONS PASSED: ${passedTests} / ${totalTests} assertions passed!`);
  console.log('================================================================\n');
}

runCompleteVerification().catch((err) => {
  console.error('\nVerification run failed:', err);
  process.exit(1);
});

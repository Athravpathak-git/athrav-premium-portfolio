// scripts/test-admin-e2e.mjs
const BASE_URL = 'http://localhost:4280';

async function testAdmin() {
  console.log('--- TESTING ADMIN AUTHENTICATION & PORTAL ---');

  // 1. Authenticate with seeded admin credentials
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'athrav_admin', password: 'ReplaceWithStrongPassword123!' }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.json();
    throw new Error(`Login failed: ${JSON.stringify(err)}`);
  }

  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('✅ Admin login succeeded, session cookie received');

  // 2. Verify /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader },
  });
  const meData = await meRes.json();
  if (!meData.authenticated) {
    throw new Error('Expected authenticated user from /api/auth/me');
  }
  console.log(`✅ Session verified for user: ${meData.user.username} (${meData.user.role})`);

  // 3. Request /admin dashboard with session
  const adminRes = await fetch(`${BASE_URL}/admin`, {
    headers: { cookie: cookieHeader },
  });
  if (adminRes.status !== 200) {
    throw new Error(`/admin page returned HTTP ${adminRes.status}`);
  }
  const adminHtml = await adminRes.text();
  if (!adminHtml.includes('ATHRAV PORTFOLIO') && !adminHtml.includes('ADMIN CONTROL CENTER')) {
    throw new Error('/admin page did not contain expected admin portal header');
  }
  console.log('✅ Admin dashboard HTML returned cleanly (HTTP 200, no hanging, no redirect loop)');

  console.log('🎉 ADMIN PORTAL VERIFICATION PASSED PERFECTLY!');
}

testAdmin().catch((err) => {
  console.error('❌ Error testing admin portal:', err);
  process.exit(1);
});

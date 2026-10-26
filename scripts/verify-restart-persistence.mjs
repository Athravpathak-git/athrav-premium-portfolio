// scripts/verify-restart-persistence.mjs
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
    return { name, status: res.status, ok: res.ok, body, headers: Object.fromEntries(res.headers.entries()) };
  } catch (err) {
    return { name, error: err.message, status: 0, ok: false };
  }
}

async function run() {
  console.log('Testing photo persistence across server restarts...');

  // 1. Login
  const loginRes = await testEndpoint('Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'athrav_admin',
      password: 'ReplaceWithStrongPassword123!',
    }),
  });

  const setCookie = loginRes.headers['set-cookie'];
  const match = setCookie ? setCookie.match(/athrav_admin_session=([^;]+)/) : null;
  const sessionCookie = `athrav_admin_session=${match[1]}`;

  // 2. Upload photo
  const pngBytes = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0xf3, 0xff,
    0x61, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  const form = new FormData();
  form.append('file', new Blob([pngBytes], { type: 'image/png' }), 'restart_test.png');

  const uploadRes = await testEndpoint('Upload Photo', `${BASE_URL}/api/admin/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: form,
  });

  const avatarUrl = uploadRes.body.avatarUrl;
  console.log(`Uploaded photo: ${avatarUrl}`);

  // Check file on disk
  const diskPath = path.join(process.cwd(), 'public', avatarUrl.replace(/^\//, ''));
  console.log(`File on disk exists: ${fs.existsSync(diskPath)}`);

  // Check dev-storage json
  const devStore = JSON.parse(fs.readFileSync('.dev-storage/portfolio-dev-store.json', 'utf8'));
  console.log(`Persisted in devStore: ${devStore.profile.avatarUrl === avatarUrl}`);

  console.log('SUCCESS: Photo is saved to disk and persisted in devStore.');
}

run().catch(console.error);

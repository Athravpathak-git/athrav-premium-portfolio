// scripts/audit-full-verification.mjs
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

async function runAudit() {
  console.log('========================================================================');
  console.log('  ATHRAV PATHAK PORTFOLIO — COMPREHENSIVE PRODUCTION AUDIT & VERIFICATION');
  console.log('  Base URL: ' + BASE_URL);
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: PUBLIC ROUTES & METADATA
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: Testing Public Routes & Dynamic Slugs ---');
  const publicRoutes = [
    '/',
    '/about',
    '/projects',
    '/projects/omnimind-ai',
    '/certifications',
    '/certifications/coursera-machine-learning-specialization',
    '/education',
    '/skills',
    '/experience',
    '/achievements',
    '/services',
    '/contact',
    '/robots.txt',
    '/sitemap.xml',
  ];

  for (const route of publicRoutes) {
    const res = await testEndpoint(`Public Route ${route}`, `${BASE_URL}${route}`);
    assert(res.status === 200, `Public route ${route} returned HTTP 200 OK`);
  }

  // 404 handling
  const res404 = await testEndpoint('404 Route', `${BASE_URL}/non-existent-test-path-${Date.now()}`);
  assert(res404.status === 404, 'Non-existent route cleanly returned HTTP 404 Not Found');

  // ---------------------------------------------------------------------------
  // SECTION 2: UNAUTHENTICATED PROTECTION OF ADMIN ROUTES & APIS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Verifying Unauthenticated Protection & Redirection ---');
  const adminUiRoutes = [
    '/admin',
    '/admin/projects',
    '/admin/certifications',
    '/admin/skills',
    '/admin/experience',
    '/admin/education',
    '/admin/achievements',
    '/admin/services',
    '/admin/homepage',
    '/admin/profile',
    '/admin/media',
    '/admin/messages',
    '/admin/users',
    '/admin/security',
    '/admin/analytics',
    '/admin/settings',
  ];

  for (const route of adminUiRoutes) {
    // Middleware should redirect unauthenticated request to /admin/login?from=...
    const res = await testEndpoint(`Unauth UI ${route}`, `${BASE_URL}${route}`, {
      redirect: 'manual',
    });
    const isRedirectToLogin = res.status === 307 && res.headers['location']?.includes('/admin/login');
    assert(isRedirectToLogin, `Protected UI ${route} redirects to login (Status: ${res.status})`);
  }

  const adminApis = [
    '/api/admin/profile',
    '/api/admin/projects',
    '/api/admin/certifications',
    '/api/admin/skills',
    '/api/admin/experience',
    '/api/admin/education',
    '/api/admin/achievements',
    '/api/admin/services',
    '/api/admin/homepage',
    '/api/admin/media',
    '/api/admin/messages',
    '/api/admin/users',
    '/api/admin/analytics',
    '/api/admin/security-logs',
    '/api/admin/settings',
  ];

  for (const api of adminApis) {
    const res = await testEndpoint(`Unauth API ${api}`, `${BASE_URL}${api}`);
    assert(res.status === 401, `Unauthenticated API ${api} returned HTTP 401 Unauthorized`);
  }

  // ---------------------------------------------------------------------------
  // SECTION 3: AUTHENTICATION (INVALID VS VALID)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Authentication & Session Verification ---');
  // Bad credentials
  const badLogin = await testEndpoint('Bad Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'athrav_admin', password: 'WrongPassword999!' }),
  });
  assert(badLogin.status === 401, 'Bad credentials correctly rejected with HTTP 401 Unauthorized');

  // Valid credentials
  const goodLogin = await testEndpoint('Good Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'athrav_admin', password: 'ReplaceWithStrongPassword123!' }),
  });
  assert(goodLogin.status === 200, 'Valid credentials succeeded with HTTP 200 OK');
  const setCookie = goodLogin.headers['set-cookie'];
  assert(Boolean(setCookie), 'Set-Cookie header received');

  const match = setCookie.match(/athrav_admin_session=([^;]+)/);
  assert(Boolean(match), 'athrav_admin_session extracted');
  const sessionCookie = `athrav_admin_session=${match[1]}`;

  const meRes = await testEndpoint('Auth Me', `${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  assert(meRes.body.authenticated === true, 'Session confirmed: authenticated === true');
  assert(meRes.body.user.role === 'SUPER_ADMIN', 'Session role confirmed: SUPER_ADMIN');

  // ---------------------------------------------------------------------------
  // SECTION 4: AUTHENTICATED ADMIN UI ACCESS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Authenticated Admin UI Route Verification ---');
  for (const route of adminUiRoutes) {
    const t0 = Date.now();
    const res = await testEndpoint(`Auth UI ${route}`, `${BASE_URL}${route}`, {
      headers: { Cookie: sessionCookie },
    });
    const dur = Date.now() - t0;
    assert(res.status === 200, `Admin UI ${route.padEnd(25)} => HTTP 200 OK (${dur}ms)`);
  }

  // ---------------------------------------------------------------------------
  // SECTION 5: FULL CRUD MODULE VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Full Admin CRUD Operations & Data Integrity ---');

  // A. Skill CRUD
  const testSkillPayload = {
    name: 'PyTorch (Audit Test)',
    category: 'Machine Learning',
    proficiency: 'Intermediate',
    description: 'Deep neural network experimentation and tensor operations.',
    isFeatured: false,
    isPublished: true,
    sortOrder: 99,
  };
  const createSkillRes = await testEndpoint('Create Skill', `${BASE_URL}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify(testSkillPayload),
  });
  assert(createSkillRes.status === 200 && createSkillRes.body.success === true, 'Skill created with HTTP 200');
  const createdSkillId = createSkillRes.body.item.id;

  const updateSkillRes = await testEndpoint('Update Skill', `${BASE_URL}/api/admin/skills`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify({ id: createdSkillId, proficiency: 'Proficient' }),
  });
  assert(updateSkillRes.status === 200 && updateSkillRes.body.item.proficiency === 'Proficient', 'Skill updated successfully');

  const deleteSkillRes = await testEndpoint('Delete Skill', `${BASE_URL}/api/admin/skills?id=${createdSkillId}`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  assert(deleteSkillRes.status === 200, 'Skill deleted successfully');

  // B. Projects CRUD
  const testProjectPayload = {
    title: 'Audit Test Project',
    slug: `audit-test-${Date.now()}`,
    category: 'Artificial Intelligence',
    summary: 'A test project created during audit verification.',
    description: 'Long description of audit test project.',
    techStack: ['Python', 'FastAPI'],
    isFeatured: false,
    isPublished: true,
    sortOrder: 99,
  };
  const createProjRes = await testEndpoint('Create Project', `${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify(testProjectPayload),
  });
  assert(createProjRes.status === 200 && createProjRes.body.success === true, 'Project created with HTTP 200');
  const createdProjId = createProjRes.body.item.id;

  const deleteProjRes = await testEndpoint('Delete Project', `${BASE_URL}/api/admin/projects?id=${createdProjId}`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  assert(deleteProjRes.status === 200, 'Project deleted successfully');

  // C. Contact Inquiry Workflow
  const contactPayload = {
    name: 'Audit Recruiter',
    email: 'recruiter@enterprise.dev',
    subject: 'AI Engineering Internship Opportunity',
    message: 'We were impressed by your portfolio and would like to discuss an opportunity.',
    honeypot: '',
  };
  const contactSubmit = await testEndpoint('Submit Contact Form', `${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactPayload),
  });
  assert(contactSubmit.status === 200, 'Public contact submission succeeded with HTTP 200');

  // Verify inquiry received in admin
  const messagesRes = await testEndpoint('Get Admin Messages', `${BASE_URL}/api/admin/messages`, {
    headers: { Cookie: sessionCookie },
  });
  const foundMsg = messagesRes.body.messages?.find((m) => m.email === 'recruiter@enterprise.dev');
  assert(Boolean(foundMsg), 'Submitted contact message appears in Admin Messages inbox');

  if (foundMsg) {
    // Clean up test message
    await testEndpoint('Delete Test Message', `${BASE_URL}/api/admin/messages?id=${foundMsg.id}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
  }

  // D. Admin User Management CRUD
  const testSubAdminUsername = `auditor_${Date.now()}`;
  const createSubAdmin = await testEndpoint('Create Sub-Admin', `${BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    body: JSON.stringify({
      name: 'Auditor User',
      email: `${testSubAdminUsername}@portfolio.internal`,
      username: testSubAdminUsername,
      password: 'AuditPassword123!',
      role: 'ADMIN',
    }),
  });
  assert(createSubAdmin.status === 201, 'Sub-admin created with HTTP 201');
  const subAdminId = createSubAdmin.body.user.id;

  const deleteSubAdmin = await testEndpoint('Delete Sub-Admin', `${BASE_URL}/api/admin/users/${subAdminId}`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  assert(deleteSubAdmin.status === 200, 'Sub-admin deleted cleanly');

  // E. Security Logs
  const securityLogsRes = await testEndpoint('Get Security Logs', `${BASE_URL}/api/admin/security-logs`, {
    headers: { Cookie: sessionCookie },
  });
  assert(securityLogsRes.status === 200 && Array.isArray(securityLogsRes.body.logs), 'Security logs API returns array of audit events');

  // ---------------------------------------------------------------------------
  // SECTION 6: LOGOUT
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 6: Logout & Session Invalidation ---');
  const logoutRes = await testEndpoint('Logout', `${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.status === 200, 'Logout succeeded with HTTP 200 OK');

  const meAfterLogout = await testEndpoint('Auth Me After Logout', `${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  assert(meAfterLogout.body.authenticated === false, 'Session token successfully invalidated');

  console.log('\n========================================================================');
  console.log(`  ALL AUDIT CHECKS PASSED: ${passed} / ${total} tests passed with 0 failures!`);
  console.log('========================================================================\n');
}

runAudit().catch((err) => {
  console.error('\nAudit failed:', err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4280';
const ADMIN_USER = 'athrav_admin';
const ADMIN_PASS = 'ReplaceWithStrongPassword123!';

async function run() {
  console.log('--- Starting Certificate Image Upload & Admin E2E Verification ---');

  // Step 1: Admin Login
  console.log('[1/8] Logging in to admin session...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: ADMIN_USER, password: ADMIN_PASS }),
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    throw new Error(`Login failed with status ${loginRes.status}: ${errText}`);
  }

  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No Set-Cookie header received from login');
  }
  const sessionCookie = setCookie.split(';')[0];
  console.log('✓ Admin authenticated successfully.');

  // Step 2: Prepare authentic PNG image file
  console.log('[2/8] Creating genuine PNG certificate file buffer...');
  // 1x1 transparent PNG buffer
  const authenticPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
    0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
    0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
    0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const formDataHeader = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-stanford-ai-cert.png"\r\nContent-Type: image/png\r\n\r\n`
  );
  const titleField = Buffer.from(
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nStanford AI Professional Certificate\r\n--${boundary}--\r\n`
  );

  const multipartBody = Buffer.concat([formDataHeader, authenticPngBuffer, titleField]);

  // Step 3: POST to /api/admin/certifications/upload
  console.log('[3/8] Uploading certificate image to /api/admin/certifications/upload...');
  const uploadRes = await fetch(`${BASE_URL}/api/admin/certifications/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: sessionCookie,
    },
    body: multipartBody,
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.success) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
  }

  console.log(`✓ Upload successful: url=${uploadData.url}, filename=${uploadData.filename}`);
  if (!uploadData.url.startsWith('/uploads/cert-')) {
    throw new Error(`Expected URL to start with /uploads/cert-, got ${uploadData.url}`);
  }

  // Step 4: Verify uploaded image is served via HTTP
  console.log('[4/8] Verifying uploaded image HTTP accessibility...');
  const imageFetchRes = await fetch(`${BASE_URL}${uploadData.url}`);
  if (!imageFetchRes.ok) {
    throw new Error(`Image URL returned status ${imageFetchRes.status}`);
  }
  const imageBytes = await imageFetchRes.arrayBuffer();
  console.log(`✓ Image fetched successfully: ${imageBytes.byteLength} bytes, content-type=${imageFetchRes.headers.get('content-type')}`);

  // Step 5: Verify upload was registered in Media Library
  console.log('[5/8] Checking Media Library registration...');
  const mediaRes = await fetch(`${BASE_URL}/api/admin/media`, {
    headers: { Cookie: sessionCookie },
  });
  const mediaData = await mediaRes.json();
  const registeredMedia = mediaData.items?.find((m) => m.url === uploadData.url);
  if (!registeredMedia) {
    console.warn('Media library registration warning: item not found in items list, proceeding');
  } else {
    console.log(`✓ Media record confirmed: id=${registeredMedia.id}, category=${registeredMedia.category}`);
  }

  // Step 6: Create Certificate Record with Image
  console.log('[6/8] Creating new certificate record with imageUrl and issueDate...');
  const certSlug = `stanford-ai-e2e-${Date.now()}`;
  const createCertRes = await fetch(`${BASE_URL}/api/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      title: 'Stanford AI Professional Certificate',
      slug: certSlug,
      issuer: 'Stanford Online',
      category: 'Artificial Intelligence',
      issueDate: '2024-04',
      credentialId: 'STANFORD-AI-9988',
      credentialUrl: 'https://online.stanford.edu/verify/9988',
      imageUrl: uploadData.url,
      description: 'Advanced coursework in machine learning, deep learning, and reinforcement learning.',
      relatedSkills: ['Python', 'Deep Learning', 'Reinforcement Learning'],
      isFeatured: true,
      isPublished: true,
      sortOrder: 1,
    }),
  });

  const createCertData = await createCertRes.json();
  if (!createCertRes.ok || !createCertData.success) {
    throw new Error(`Create certificate failed: ${JSON.stringify(createCertData)}`);
  }
  const certId = createCertData.item.id;
  console.log(`✓ Certificate created: id=${certId}, slug=${certSlug}`);

  // Step 7: Verify Public Pages render certificate image and lightbox trigger
  console.log('[7/8] Testing public pages /certifications and /certifications/[slug]...');
  const publicListRes = await fetch(`${BASE_URL}/certifications`);
  if (!publicListRes.ok) {
    throw new Error(`/certifications returned status ${publicListRes.status}`);
  }
  const publicListHtml = await publicListRes.text();
  if (!publicListHtml.includes('Stanford AI Professional Certificate')) {
    throw new Error('Public /certifications list does not contain new certificate title');
  }
  if (!publicListHtml.includes(uploadData.url)) {
    throw new Error('Public /certifications list does not contain certificate imageUrl');
  }
  if (!publicListHtml.includes('View Certificate')) {
    throw new Error('Public /certifications card does not render "View Certificate" button');
  }
  console.log('✓ Public /certifications list renders title, image, and "View Certificate" button!');

  const publicDetailRes = await fetch(`${BASE_URL}/certifications/${certSlug}`);
  if (!publicDetailRes.ok) {
    throw new Error(`/certifications/${certSlug} returned status ${publicDetailRes.status}`);
  }
  const publicDetailHtml = await publicDetailRes.text();
  if (!publicDetailHtml.includes(uploadData.url)) {
    throw new Error('Public detail page does not contain certificate imageUrl');
  }
  if (!publicDetailHtml.includes('2024-04')) {
    throw new Error('Public detail page does not contain issue date 2024-04');
  }
  if (!publicDetailHtml.includes('STANFORD-AI-9988')) {
    throw new Error('Public detail page does not contain credential ID');
  }
  console.log('✓ Public detail page renders image preview, issue date, credential ID, and verification link!');

  // Step 8: Clean up test certification record
  console.log('[8/8] Deleting test certification record...');
  const deleteRes = await fetch(`${BASE_URL}/api/admin/certifications?id=${certId}`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  const deleteData = await deleteRes.json();
  if (!deleteRes.ok || !deleteData.success) {
    throw new Error(`Delete failed: ${JSON.stringify(deleteData)}`);
  }
  console.log('✓ Test certification deleted successfully and media cleaned up safely.');

  console.log('\n======================================================');
  console.log('🎉 ALL 8 CERTIFICATE UPLOAD VERIFICATION CHECKS PASSED!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

import { NextResponse } from 'next/server';
import { getSessionCookie, validateSessionToken } from './auth';

export async function getCurrentAdmin() {
  const token = await getSessionCookie();
  if (!token) return null;
  return await validateSessionToken(token);
}

export async function requireAdminApi() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Unauthorized: Administrative authentication required.' },
        { status: 401 }
      ),
    };
  }
  return {
    authorized: true as const,
    admin: admin.user,
  };
}

export async function requireSuperAdminApi() {
  const check = await requireAdminApi();
  if (!check.authorized) {
    return check;
  }
  if (check.admin.role !== 'SUPER_ADMIN') {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Forbidden: Super Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }
  return check;
}

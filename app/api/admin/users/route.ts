import { NextResponse } from 'next/server';
import { requireSuperAdminApi } from '@/lib/auth-guard';
import { getAllAdminUsers } from '@/lib/auth';

export async function GET() {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  const users = await getAllAdminUsers();
  return NextResponse.json({ users });
}

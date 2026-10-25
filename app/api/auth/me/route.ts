import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-guard';

export async function GET() {
  const current = await getCurrentAdmin();
  if (!current) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: current.user,
  });
}

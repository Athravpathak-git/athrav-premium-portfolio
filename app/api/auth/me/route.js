import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/session.js';

export async function GET() {
  const current = await getCurrentAdmin();
  if (!current || !current.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: current.user.id,
      username: current.user.username,
      role: current.user.role,
      mustChangePassword: current.user.mustChangePassword,
    },
  });
}

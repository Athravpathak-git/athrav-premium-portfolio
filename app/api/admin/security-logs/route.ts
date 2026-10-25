import { NextResponse } from 'next/server';
import { requireSuperAdminApi } from '@/lib/auth-guard';
import { getAuditLogsList } from '@/lib/data-service';

export async function GET(req: Request) {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit')) || 50));

  const logs = await getAuditLogsList(limit);
  return NextResponse.json({ logs });
}

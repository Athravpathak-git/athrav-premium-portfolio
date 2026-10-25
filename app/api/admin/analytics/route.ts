import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getAnalyticsSummary } from '@/lib/data-service';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const summary = await getAnalyticsSummary();
  return NextResponse.json({ summary });
}

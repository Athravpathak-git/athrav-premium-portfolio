import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth-guard';
import { getSettings, updateSettings } from '@/lib/data-service';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const settings = await getSettings();
  return NextResponse.json({ settings }, { headers: NO_CACHE_HEADERS });
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const updated = await updateSettings(body);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'WEBSITE_SETTINGS_UPDATED',
      entityType: 'WebsiteSetting',
      req,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/contact');
      revalidatePath('/about');
    } catch (revalidateErr) {
      console.warn('[API Admin Settings PUT] Revalidation warning:', revalidateErr);
    }

    return NextResponse.json({ success: true, settings: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error('[API Admin Settings PUT Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update website settings.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

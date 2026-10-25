import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getSettings, updateSettings } from '@/lib/data-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const settings = await getSettings();
  return NextResponse.json({ settings });
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

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error('[API Admin Settings PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update website settings.' }, { status: 500 });
  }
}

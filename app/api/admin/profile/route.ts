import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getProfile, updateProfile } from '@/lib/data-service';
import { profileSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateProfile(validation.data);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'PROFILE_UPDATED',
      entityType: 'Profile',
      req,
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    console.error('[API Admin Profile PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}

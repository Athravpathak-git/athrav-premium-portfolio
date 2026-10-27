import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth-guard';
import { getProfile, updateProfile } from '@/lib/data-service';
import { profileSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const profile = await getProfile();
  return NextResponse.json(
    { profile },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
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
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const updated = await updateProfile(validation.data);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'PROFILE_UPDATED',
      entityType: 'Profile',
      req,
    });

    // Revalidate cached layouts and public pages
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/contact');
      revalidatePath('/about');
    } catch (revalidateErr) {
      console.warn('[API Admin Profile PUT] Revalidation warning:', revalidateErr);
    }

    return NextResponse.json(
      { success: true, profile: updated },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('[API Admin Profile PUT Error]:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update profile.' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

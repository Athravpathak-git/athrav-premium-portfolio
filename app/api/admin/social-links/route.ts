import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getSocialLinksList,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
} from '@/lib/data-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const links = await getSocialLinksList();
    return NextResponse.json({
      success: true,
      links,
    });
  } catch (err: unknown) {
    console.error('[API Social Links GET Error]:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve social links.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : '';
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    let url = typeof body.url === 'string' ? body.url.trim() : '';
    const icon = typeof body.icon === 'string' && body.icon.trim() ? body.icon.trim() : 'Link';

    if (!platform || !label) {
      return NextResponse.json(
        { error: 'Platform identifier and label are required.' },
        { status: 400 }
      );
    }

    if (platform === 'email' && url && !url.startsWith('mailto:')) {
      url = `mailto:${url}`;
    }

    const created = await createSocialLink({
      platform,
      label,
      url,
      username: body.username ? String(body.username).trim() : null,
      icon,
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : Boolean(url),
      showInHeader: Boolean(body.showInHeader),
      showInFooter: body.showInFooter !== undefined ? Boolean(body.showInFooter) : true,
      showInContact: body.showInContact !== undefined ? Boolean(body.showInContact) : true,
      showInAbout: body.showInAbout !== undefined ? Boolean(body.showInAbout) : true,
      showInHero: Boolean(body.showInHero),
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 99,
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SOCIAL_LINK_CREATED',
      entityType: 'SocialLink',
      entityId: created.id,
      req,
      metadata: { platform: created.platform, label: created.label },
    });

    return NextResponse.json({
      success: true,
      link: created,
      message: `Social link "${created.label}" created successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create social link.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();

    // Check if reordering batch
    if (Array.isArray(body.reorder)) {
      await reorderSocialLinks(body.reorder);
      await logAuditEvent({
        userId: auth.admin.id,
        action: 'SOCIAL_LINKS_REORDERED',
        entityType: 'SocialLink',
        req,
        metadata: { count: body.reorder.length },
      });
      return NextResponse.json({
        success: true,
        message: 'Social links order updated successfully.',
      });
    }

    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Social Link ID is required.' }, { status: 400 });
    }

    let url = typeof body.url === 'string' ? body.url.trim() : undefined;
    if (url !== undefined && body.platform === 'email' && url && !url.startsWith('mailto:')) {
      url = `mailto:${url}`;
    }

    const updated = await updateSocialLink(id, {
      label: typeof body.label === 'string' ? body.label.trim() : undefined,
      url,
      username: body.username !== undefined ? (body.username ? String(body.username).trim() : null) : undefined,
      icon: typeof body.icon === 'string' ? body.icon.trim() : undefined,
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : undefined,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
      showInHeader: body.showInHeader !== undefined ? Boolean(body.showInHeader) : undefined,
      showInFooter: body.showInFooter !== undefined ? Boolean(body.showInFooter) : undefined,
      showInContact: body.showInContact !== undefined ? Boolean(body.showInContact) : undefined,
      showInAbout: body.showInAbout !== undefined ? Boolean(body.showInAbout) : undefined,
      showInHero: body.showInHero !== undefined ? Boolean(body.showInHero) : undefined,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Social link not found.' }, { status: 404 });
    }

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SOCIAL_LINK_UPDATED',
      entityType: 'SocialLink',
      entityId: id,
      req,
      metadata: { platform: updated.platform, label: updated.label },
    });

    return NextResponse.json({
      success: true,
      link: updated,
      message: `Social link "${updated.label}" updated successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update social link.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Social Link ID is required.' }, { status: 400 });
    }

    const deleted = await deleteSocialLink(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Social link not found.' }, { status: 404 });
    }

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SOCIAL_LINK_DELETED',
      entityType: 'SocialLink',
      entityId: id,
      req,
    });

    return NextResponse.json({
      success: true,
      message: 'Social link deleted successfully.',
    });
  } catch (err: unknown) {
    console.error('[API Social Link DELETE Error]:', err);
    return NextResponse.json(
      { error: 'Failed to delete social link.' },
      { status: 500 }
    );
  }
}

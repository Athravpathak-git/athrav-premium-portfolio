import { NextResponse } from 'next/server';
import { getSocialLinksList } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement') as 'header' | 'footer' | 'contact' | 'about' | 'hero' | null;

    const links = await getSocialLinksList({
      publishedOnly: true,
      placement: placement || undefined,
    });

    return NextResponse.json({
      success: true,
      links,
    });
  } catch (err: unknown) {
    console.error('[Public API Social Links GET Error]:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve social links.' },
      { status: 500 }
    );
  }
}

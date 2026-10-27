import { NextResponse } from 'next/server';
import { getSocialLinksList } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement') as 'header' | 'footer' | 'contact' | 'about' | 'hero' | null;

    const links = await getSocialLinksList({
      publishedOnly: true,
      placement: placement || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        links,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    console.error('[Public API Social Links GET Error]:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve social links.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic execution for uploads route handler
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    // Security check: Prevent path traversal
    for (const segment of pathSegments) {
      if (segment.includes('..') || segment.startsWith('.') || segment.includes('\\')) {
        return new NextResponse('Forbidden: Path traversal not allowed', { status: 403 });
      }
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Not a File', { status: 400 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeMap[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[Uploads Route Error]:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

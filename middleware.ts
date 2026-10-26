import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'athrav_admin_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // If accessing the login page:
    if (pathname === '/admin/login') {
      const fromParam = req.nextUrl.searchParams.get('from');
      if (sessionToken && !fromParam) {
        // Already logged in, redirect to overview
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    // If accessing any protected admin route without session cookie:
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

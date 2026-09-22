import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

/**
 * Next.js 16 request-boundary hook (the renamed `middleware` convention).
 *
 * Protects:
 *   - /admin/*     pages    → unauthenticated users are redirected to /admin/login
 *   - /api/admin/* route API → unauthenticated requests get 401 JSON
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public entry points that must stay reachable without a session.
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = token ? await verifyAdminSessionToken(token) : false;

  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12h

function getSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET
  );
}

export async function createAdminSessionToken(username: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    // Browsers only send Secure cookies over HTTPS; keep it off in local dev.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Verify the admin session from a Route Handler request.
 * Returns a 401 response when invalid, or null when authorized.
 * (proxy.ts already gates /api/admin/* — this is defense in depth.)
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = match?.split('=').slice(1).join('=');

  if (!token || !(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }
  return null;
}

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isAdminAuthConfigured,
} from '@/lib/adminSession';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

const MAX_BODY_BYTES = 1024;
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const credentialsSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Burn a comparison anyway so length doesn't leak timing.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: '요청이 너무 큽니다' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  if (!isAdminAuthConfigured()) {
    console.error(
      '[admin/login] ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET are not configured'
    );
    return NextResponse.json(
      { error: '서버 설정 오류입니다. 관리자에게 문의하세요.' },
      { status: 500 }
    );
  }

  const { username, password } = parsed.data;
  const usernameOk = safeEqual(username, process.env.ADMIN_USERNAME!);
  const passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD!);

  if (!usernameOk || !passwordOk) {
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  const token = await createAdminSessionToken(username);
  if (!token) {
    return NextResponse.json(
      { error: '서버 설정 오류입니다. 관리자에게 문의하세요.' },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return response;
}

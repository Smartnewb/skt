import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createConsultation,
  hasRecentConsultationByPhone,
} from '@/lib/consultationDatabase';
import {
  sendSlackNotification,
  formatConsultationSlackMessage,
} from '@/lib/slack';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 8 * 1024; // ~8KB

const CONSENT_VERSION = 'v1';

const consultationSchema = z.object({
  customerName: z.string().trim().min(1, '이름을 입력해주세요').max(50),
  customerPhone: z
    .string()
    .transform((v) => v.replace(/-/g, ''))
    .pipe(
      z
        .string()
        .regex(/^01[0-9]\d{7,8}$/, '올바른 휴대폰 번호를 입력해주세요')
    ),
  interestedProduct: z.string().trim().min(1, '관심 상품을 선택해주세요').max(100),
  region: z
    .string()
    .trim()
    .min(2, '설치 지역을 입력해주세요')
    .max(50)
    // 시/군/구 수준만 허용 — 상세주소(동/호/층/번지) 차단
    .refine((v) => !/\d+\s*(동|호|층|번지)|로\s?\d|길\s?\d|번길/.test(v), {
      message: '시/군/구까지만 입력해주세요 (상세주소 불필요)',
    }),
  preferredTime: z.enum(['ANYTIME', 'MORNING', 'AFTERNOON', 'EVENING']),
  privacyConsent: z
    .boolean()
    .refine((v) => v === true, { message: '개인정보 수집 및 이용에 동의해주세요' }),
  // Honeypot — must stay empty; filled means bot (handled below).
  website: z.string().max(200).optional(),
  'cf-turnstile-response': z.string().max(2048).optional(),
});

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Verification off unless configured.
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== 'unknown') body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  // Best-effort rate limiting (per instance; see lib/rateLimit.ts).
  const ipRate = checkRateLimit(`consult:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipRate.allowed) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(ipRate.retryAfterSeconds) } }
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: '요청이 너무 큽니다' }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: '요청이 너무 큽니다' }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다' },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot triggered → pretend success, insert nothing.
  if (data.website !== undefined && data.website !== '') {
    return NextResponse.json({ success: true, message: '상담 신청이 접수되었습니다' }, { status: 201 });
  }

  if (!(await verifyTurnstile(data['cf-turnstile-response'], ip))) {
    return NextResponse.json(
      { error: '자동 등록 방지 확인에 실패했습니다. 다시 시도해주세요.' },
      { status: 400 }
    );
  }

  const phoneRate = checkRateLimit(`consult:phone:${data.customerPhone}`, 5, 60 * 60 * 1000);
  if (!phoneRate.allowed) {
    return NextResponse.json(
      { error: '동일 연락처로 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(phoneRate.retryAfterSeconds) } }
    );
  }

  if (await hasRecentConsultationByPhone(data.customerPhone, 24)) {
    return NextResponse.json(
      { error: '이미 접수된 상담 신청이 있습니다. 담당자가 곧 연락드리겠습니다.' },
      { status: 409 }
    );
  }

  try {
    const inserted = await createConsultation({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      interestedProduct: data.interestedProduct,
      region: data.region,
      preferredTime: data.preferredTime,
      privacyConsent: true,
      consentVersion: CONSENT_VERSION,
      consentedAt: new Date().toISOString(),
    });

    const slackMessage = formatConsultationSlackMessage({
      id: inserted.id,
      customerPhone: inserted.customer_phone,
      interestedProduct: inserted.interested_product,
      region: inserted.region,
      preferredTime: inserted.preferred_time,
    });
    await sendSlackNotification(slackMessage);

    return NextResponse.json(
      { success: true, message: '상담 신청이 접수되었습니다' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { error: '상담 신청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

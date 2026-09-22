import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminSession';
import { getConsultations } from '@/lib/consultationDatabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const consultations = await getConsultations();
    return NextResponse.json({ consultations });
  } catch (error) {
    console.error('[admin/consultations] GET failed:', error);
    return NextResponse.json(
      { error: '상담 목록을 불러오지 못했습니다' },
      { status: 500 }
    );
  }
}

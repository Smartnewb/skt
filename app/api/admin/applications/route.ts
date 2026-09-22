import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminSession';
import { getApplications } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const applications = await getApplications();
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('[admin/applications] GET failed:', error);
    return NextResponse.json(
      { error: '신청 목록을 불러오지 못했습니다' },
      { status: 500 }
    );
  }
}

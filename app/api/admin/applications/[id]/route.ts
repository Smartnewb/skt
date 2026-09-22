import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/adminSession';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { getApplication, transformDbToApplication } from '@/lib/database';

export const dynamic = 'force-dynamic';

const ADMIN_STATUSES = [
  'NEW',
  'CONSULTING',
  'SUBMITTED',
  'SCHEDULED',
  'INSTALLED',
  'PAID',
  'CANCELLED',
  // Legacy values still stored on older rows.
  'PENDING',
  'PROCESSING',
  'COMPLETED',
] as const;

const patchSchema = z.object({
  status: z.enum(ADMIN_STATUSES),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const application = await getApplication(id);
    return NextResponse.json({ application });
  } catch (error) {
    console.error('[admin/applications/[id]] GET failed:', error);
    return NextResponse.json(
      { error: '신청 정보를 불러오지 못했습니다' },
      { status: 404 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  try {
    const { data: current, error: fetchError } = await supabase
      .from('applications')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: '신청 정보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const newStatus = parsed.data.status;

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[admin/applications/[id]] PATCH failed:', updateError);
      return NextResponse.json(
        { error: '상태 변경에 실패했습니다' },
        { status: 500 }
      );
    }

    // Audit trail — best-effort; a missing status_history table never
    // blocks the status change itself.
    if (current.status !== newStatus) {
      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          app_id: id,
          old_status: current.status ?? null,
          new_status: newStatus,
          changed_by: 'admin',
        });
      if (historyError) {
        console.error('[admin/applications/[id]] status_history insert failed:', historyError);
      }
    }

    return NextResponse.json({ application: transformDbToApplication(updated) });
  } catch (error) {
    console.error('[admin/applications/[id]] PATCH errored:', error);
    return NextResponse.json(
      { error: '상태 변경 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

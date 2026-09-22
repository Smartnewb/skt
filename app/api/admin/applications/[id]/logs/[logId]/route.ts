import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/adminSession';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  isPinned: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string; logId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id, logId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '요청 값이 올바르지 않습니다' }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseServer()
      .from('consultation_logs')
      .update({ is_pinned: parsed.data.isPinned })
      .eq('id', logId)
      .eq('app_id', id)
      .select()
      .single();

    if (error) {
      console.error('[admin logs] PATCH failed:', error);
      return NextResponse.json(
        { error: '메모 고정 변경에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ log: data });
  } catch (error) {
    console.error('[admin logs] PATCH errored:', error);
    return NextResponse.json(
      { error: '메모 고정 변경 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/adminSession';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  callbackTime: z.string().datetime({ offset: true }).optional(),
  isPinned: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const { data, error } = await getSupabaseServer()
      .from('consultation_logs')
      .select('*')
      .eq('app_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[admin logs] GET failed:', error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data ?? [] });
  } catch (error) {
    console.error('[admin logs] GET errored:', error);
    return NextResponse.json(
      { error: '상담 기록을 불러오지 못했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '메모 내용이 올바르지 않습니다' }, { status: 400 });
  }

  const { content, callbackTime, isPinned } = parsed.data;

  try {
    const { data, error } = await getSupabaseServer()
      .from('consultation_logs')
      .insert({
        app_id: id,
        admin_id: 'admin',
        admin_name: '관리자',
        content,
        is_pinned: isPinned ?? false,
        callback_time: callbackTime ?? null,
        log_type: callbackTime ? 'callback' : 'memo',
      })
      .select()
      .single();

    if (error) {
      console.error('[admin logs] POST failed:', error);
      return NextResponse.json(
        { error: '메모 저장에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ log: data }, { status: 201 });
  } catch (error) {
    console.error('[admin logs] POST errored:', error);
    return NextResponse.json(
      { error: '메모 저장 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

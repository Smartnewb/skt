import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  const { data, error } = await getSupabaseServer()
    .from('applications')
    .select('id')
    .limit(1);

  if (error) {
    console.error('[health/supabase] check failed:', error);
    return NextResponse.json(
      {
        ok: false,
        service: 'supabase',
        elapsedMs: Date.now() - startedAt,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      service: 'supabase',
      checkedTable: 'applications',
      rowCount: data?.length ?? 0,
      elapsedMs: Date.now() - startedAt,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

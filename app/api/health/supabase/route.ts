import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        service: 'supabase',
        error: error.message,
        code: error.code,
        elapsedMs: Date.now() - startedAt,
      },
      { status: 503 }
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

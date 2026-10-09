import { NextResponse, type NextRequest } from 'next/server';
import { autorizadoAppsScript } from '@/lib/autorizacion';
import { supabaseAdmin } from '@/lib/supabase/admin';

/** Apps Script marca como avisados los reclamos cuyo correo ya envió. */
export async function POST(req: NextRequest) {
  if (!autorizadoAppsScript(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { ids } = (await req.json().catch(() => ({}))) as { ids?: unknown };
  const lista = Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x)) : [];
  if (!lista.length) return NextResponse.json({ actualizados: 0 });

  const { error, count } = await supabaseAdmin()
    .from('reclamaciones')
    .update({ notificado_en: new Date().toISOString() }, { count: 'exact' })
    .in('id', lista);
  if (error) {
    console.error('reclamos notificados', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ actualizados: count ?? 0 });
}

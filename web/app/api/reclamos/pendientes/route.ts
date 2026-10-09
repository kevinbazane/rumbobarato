import { NextResponse, type NextRequest } from 'next/server';
import { autorizadoAppsScript } from '@/lib/autorizacion';
import { fechaLimiteRespuesta, numeroHoja } from '@/lib/reclamo';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Reclamos todavía no avisados por correo. Lo consulta Apps Script cada pocos
 * minutos (Authorization: Bearer OFERTAS_API_SECRET) para enviarte el aviso.
 */
export async function GET(req: NextRequest) {
  if (!autorizadoAppsScript(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin()
    .from('reclamaciones')
    .select('*')
    .is('notificado_en', null)
    .order('numero', { ascending: true })
    .limit(20);
  if (error) {
    console.error('reclamos pendientes', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    reclamos: (data ?? []).map((r) => ({
      ...r,
      hoja: numeroHoja(r.numero, r.creado_en),
      fecha_limite: fechaLimiteRespuesta(r.creado_en),
    })),
  });
}

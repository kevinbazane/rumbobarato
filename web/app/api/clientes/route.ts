import { NextResponse, type NextRequest } from 'next/server';
import { autorizadoAppsScript } from '@/lib/autorizacion';
import { armarClientes, type PagoCliente, type PerfilCliente } from '@/lib/clientes';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Lista de clientes (quienes pagaron al menos una vez) con el estado de su plan.
 * La consulta Apps Script para llenar el Google Sheet. Protegida con OFERTAS_API_SECRET.
 */
export async function GET(req: NextRequest) {
  if (!autorizadoAppsScript(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const db = supabaseAdmin();

  // Supabase entrega máximo 1000 filas por consulta: se leen por páginas.
  async function todas<T>(tabla: string, columnas: string, filtro?: (q: any) => any): Promise<T[]> {
    const filas: T[] = [];
    for (let desde = 0; ; desde += 1000) {
      let q = db.from(tabla).select(columnas).range(desde, desde + 999);
      if (filtro) q = filtro(q);
      const { data, error } = await q;
      if (error) throw error;
      filas.push(...((data ?? []) as T[]));
      if (!data || data.length < 1000) return filas;
    }
  }

  try {
    const conPremium = (q: any) => q.not('premium_hasta', 'is', null);
    let perfiles: PerfilCliente[];
    try {
      perfiles = await todas<PerfilCliente>('perfiles', 'id, email, nombre, whatsapp, acepta_promos, promos_aceptadas_en, premium_hasta', conPremium);
    } catch {
      // Respaldo si aún no existen las columnas de WhatsApp.
      perfiles = await todas<PerfilCliente>('perfiles', 'id, email, nombre, premium_hasta', conPremium);
    }
    const pagos = await todas<PagoCliente>('pagos', 'usuario_id, monto, metodo, creado_en');
    return NextResponse.json({ clientes: armarClientes(perfiles, pagos), generado_en: new Date().toISOString() });
  } catch (e) {
    console.error('clientes', e);
    return NextResponse.json({ error: 'No se pudo leer la lista de clientes' }, { status: 500 });
  }
}

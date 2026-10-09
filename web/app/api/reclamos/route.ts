import { NextResponse, type NextRequest } from 'next/server';
import { MODO_DEMO } from '@/lib/config';
import { numeroHoja, validarReclamo } from '@/lib/reclamo';
import { supabaseAdmin } from '@/lib/supabase/admin';

/** Registra una hoja del Libro de Reclamaciones y devuelve su número correlativo. */
export async function POST(req: NextRequest) {
  const entrada = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!entrada) return NextResponse.json({ ok: false, mensaje: 'Datos inválidos.' }, { status: 400 });

  // Campo trampa: las personas no lo ven; los robots lo llenan.
  if (typeof entrada.sitio_web === 'string' && entrada.sitio_web.trim()) {
    return NextResponse.json({ ok: false, mensaje: 'No se pudo registrar.' }, { status: 400 });
  }

  const v = validarReclamo(entrada);
  if (!v.ok) return NextResponse.json({ ok: false, errores: v.errores }, { status: 400 });
  if (MODO_DEMO) return NextResponse.json({ ok: false, mensaje: 'El Libro de Reclamaciones se activa al configurar Supabase.' }, { status: 503 });

  const { data, error } = await supabaseAdmin()
    .from('reclamaciones')
    .insert(v.datos)
    .select('numero, creado_en')
    .single();
  if (error || !data) {
    console.error('reclamos', error);
    return NextResponse.json({ ok: false, mensaje: 'No pudimos registrar tu hoja. Intenta de nuevo o escríbenos por correo.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, numero: numeroHoja(data.numero, data.creado_en), creado_en: data.creado_en, datos: v.datos });
}

import { NextResponse, type NextRequest } from 'next/server';
import { obtenerSesion } from '@/lib/sesion';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizarWhatsapp } from '@/lib/whatsapp';

/**
 * Guarda el WhatsApp del usuario conectado y su permiso para recibir promociones.
 * El permiso solo se registra si el usuario marcó la casilla (consentimiento expreso).
 */
export async function POST(req: NextRequest) {
  const { usuario } = await obtenerSesion();
  if (!usuario) return NextResponse.json({ ok: false, mensaje: 'Inicia sesión.' }, { status: 401 });

  const { whatsapp, aceptaPromos } = (await req.json().catch(() => ({}))) as { whatsapp?: string; aceptaPromos?: boolean };
  const texto = (whatsapp ?? '').trim();
  const numero = texto ? normalizarWhatsapp(texto) : null;
  if (texto && !numero) {
    return NextResponse.json({ ok: false, mensaje: 'Revisa el número: un celular peruano tiene 9 dígitos y empieza con 9.' }, { status: 400 });
  }
  const acepta = aceptaPromos === true && !!numero;

  const { error } = await supabaseAdmin()
    .from('perfiles')
    .update({
      whatsapp: numero,
      acepta_promos: acepta,
      promos_aceptadas_en: acepta ? new Date().toISOString() : null,
    })
    .eq('id', usuario.id);
  if (error) {
    console.error('perfil whatsapp', error);
    return NextResponse.json({ ok: false, mensaje: 'No pudimos guardar tu número. Intenta de nuevo.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, whatsapp: numero, aceptaPromos: acepta });
}

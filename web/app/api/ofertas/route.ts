import { randomInt, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { SITIO } from '@/lib/config';
import { guiaDestino } from '@/lib/destinos';
import { buscarImagenes } from '@/lib/imagenes';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Publica una oferta desde Apps Script.
 * POST /api/ofertas  (Authorization: Bearer OFERTAS_API_SECRET)
 * Responde { url, codigo } con el link corto de la oferta. Si la misma oferta
 * (misma clave) ya existe, devuelve su link sin duplicarla.
 */
export async function POST(req: NextRequest) {
  if (!autorizado(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const oferta = validar(datos);
  if (typeof oferta === 'string') return NextResponse.json({ error: oferta }, { status: 400 });

  const db = supabaseAdmin();
  const { data: existente } = await db.from('ofertas').select('codigo').eq('clave', oferta.clave).maybeSingle();
  if (existente) return NextResponse.json({ url: `${SITIO.url}/o/${existente.codigo}`, codigo: existente.codigo });

  const guia = guiaDestino(oferta.destino_nombre, oferta.alcance === 'internacional');
  const imagenes = await buscarImagenes(guia);

  for (let intento = 0; intento < 5; intento++) {
    const codigo = codigoCorto();
    const { error } = await db.from('ofertas').insert({ ...oferta, codigo, imagenes });
    if (!error) return NextResponse.json({ url: `${SITIO.url}/o/${codigo}`, codigo }, { status: 201 });
    if (error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 });
    // 23505 = duplicado: o el código corto ya existía (se reintenta) o la misma oferta llegó dos veces.
    const { data: carrera } = await db.from('ofertas').select('codigo').eq('clave', oferta.clave).maybeSingle();
    if (carrera) return NextResponse.json({ url: `${SITIO.url}/o/${carrera.codigo}`, codigo: carrera.codigo });
  }
  return NextResponse.json({ error: 'No se pudo generar el código' }, { status: 500 });
}

function autorizado(cabecera: string | null): boolean {
  const secreto = process.env.OFERTAS_API_SECRET;
  if (!secreto || !cabecera?.startsWith('Bearer ')) return false;
  const a = Buffer.from(cabecera.slice(7));
  const b = Buffer.from(secreto);
  return a.length === b.length && timingSafeEqual(a, b);
}

const LETRAS = 'abcdefghjkmnpqrstuvwxyz23456789';
function codigoCorto(): string {
  return Array.from({ length: 6 }, () => LETRAS[randomInt(LETRAS.length)]).join('');
}

function validar(d: Record<string, unknown>) {
  const texto = (k: string, max = 200) => (typeof d[k] === 'string' && d[k] && (d[k] as string).length <= max ? (d[k] as string).trim() : null);
  const fecha = (k: string) => (typeof d[k] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d[k] as string) ? (d[k] as string) : null);
  const numero = (k: string) => (typeof d[k] === 'number' && Number.isFinite(d[k]) ? (d[k] as number) : null);

  const alcance = d.alcance === 'nacional' || d.alcance === 'internacional' ? d.alcance : null;
  const o = {
    clave: texto('clave'),
    alcance,
    origen_codigo: texto('origen_codigo', 5),
    origen_nombre: texto('origen_nombre', 80),
    destino_codigo: texto('destino_codigo', 5),
    destino_nombre: texto('destino_nombre', 80),
    precio: numero('precio'),
    moneda: texto('moneda', 5) ?? 'PEN',
    fecha_ida: fecha('fecha_ida'),
    fecha_vuelta: fecha('fecha_vuelta'),
    escalas: numero('escalas'),
    aerolinea: texto('aerolinea', 80),
    link_google_flights: texto('link_google_flights', 4000),
  };
  const faltan = Object.entries(o)
    .filter(([k, v]) => v === null && k !== 'origen_codigo' && k !== 'destino_codigo')
    .map(([k]) => k);
  if (faltan.length) return `Faltan o son inválidos: ${faltan.join(', ')}`;
  if (!/^https:\/\//.test(o.link_google_flights!)) return 'link_google_flights debe ser https';
  return o as { [K in keyof typeof o]: NonNullable<(typeof o)[K]> } & { origen_codigo: string | null; destino_codigo: string | null };
}

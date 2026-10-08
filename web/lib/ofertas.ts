import 'server-only';
import { DIAS_VIGENCIA_OFERTA, MODO_DEMO } from './config.ts';
import { OFERTAS_DEMO } from './demo.ts';
import { supabaseAdmin } from './supabase/admin.ts';
import type { Alcance, Oferta, OfertaBloqueada, OfertaVisible } from './tipos.ts';

/** Para quien no tiene Premium: una internacional muestra solo el destino y la foto. */
export function bloquear(o: Oferta): OfertaBloqueada {
  return {
    id: o.id, codigo: o.codigo, alcance: o.alcance, origen_nombre: o.origen_nombre,
    destino_nombre: o.destino_nombre, imagenes: o.imagenes, creado_en: o.creado_en, bloqueada: true,
  };
}

export function visibleSegunPlan(o: Oferta, accesoPremium: boolean): OfertaVisible {
  return o.alcance === 'internacional' && !accesoPremium ? bloquear(o) : o;
}

function hoyLima(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}

/**
 * Últimas ofertas (detectadas en los últimos días y con fecha de ida futura).
 * Se leen con la clave de servicio y se recortan aquí según el plan, para
 * poder mostrar las internacionales bloqueadas como vitrina.
 */
export async function listarOfertas(alcance: Alcance, accesoPremium: boolean, limite = 24): Promise<OfertaVisible[]> {
  const hoy = hoyLima();
  let ofertas: Oferta[];
  if (MODO_DEMO) {
    ofertas = OFERTAS_DEMO.filter((o) => o.alcance === alcance && o.fecha_ida >= hoy);
  } else {
    const desde = new Date(Date.now() - DIAS_VIGENCIA_OFERTA * 86400000).toISOString();
    const { data, error } = await supabaseAdmin()
      .from('ofertas')
      .select('*')
      .eq('alcance', alcance)
      .gte('creado_en', desde)
      .gte('fecha_ida', hoy)
      .order('creado_en', { ascending: false })
      .limit(limite);
    if (error) throw error;
    ofertas = (data ?? []) as Oferta[];
  }
  return ofertas.slice(0, limite).map((o) => visibleSegunPlan(o, accesoPremium));
}

export async function obtenerOferta(codigo: string): Promise<Oferta | null> {
  if (MODO_DEMO) return OFERTAS_DEMO.find((o) => o.codigo === codigo) ?? null;
  const { data, error } = await supabaseAdmin().from('ofertas').select('*').eq('codigo', codigo).maybeSingle();
  if (error) throw error;
  return (data as Oferta | null) ?? null;
}

/** Otras ofertas para sugerir al final de una oferta (excluye la actual). */
export async function otrasOfertas(actual: Oferta, accesoPremium: boolean): Promise<OfertaVisible[]> {
  const lista = await listarOfertas('nacional', accesoPremium, 8);
  return lista.filter((o) => o.codigo !== actual.codigo).slice(0, 3);
}

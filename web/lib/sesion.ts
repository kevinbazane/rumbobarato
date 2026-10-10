import 'server-only';
import { cache } from 'react';
import { MODO_DEMO } from './config.ts';
import { estadoPlan, type EstadoPlan } from './plan.ts';
import { supabaseServidor } from './supabase/server.ts';

export interface Sesion {
  usuario: { id: string; email: string; nombre: string | null; whatsapp: string | null; aceptaPromos: boolean } | null;
  plan: EstadoPlan;
}

/** Usuario conectado y estado de su plan (una sola consulta por request). */
export const obtenerSesion = cache(async (): Promise<Sesion> => {
  if (MODO_DEMO) return { usuario: null, plan: estadoPlan(null) };

  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { usuario: null, plan: estadoPlan(null) };

  type Perfil = { nombre: string | null; premium_hasta: string | null; whatsapp?: string | null; acepta_promos?: boolean };
  let { data: perfil, error } = await supabase
    .from('perfiles')
    .select('nombre, premium_hasta, whatsapp, acepta_promos')
    .eq('id', data.user.id)
    .maybeSingle<Perfil>();
  if (error) {
    // Respaldo si aún no se agregaron las columnas de WhatsApp: el plan Premium nunca debe perderse por eso.
    ({ data: perfil } = await supabase.from('perfiles').select('nombre, premium_hasta').eq('id', data.user.id).maybeSingle<Perfil>());
  }

  return {
    usuario: {
      id: data.user.id,
      email: data.user.email ?? '',
      nombre: perfil?.nombre ?? (data.user.user_metadata?.full_name as string | undefined) ?? null,
      whatsapp: perfil?.whatsapp ?? null,
      aceptaPromos: perfil?.acepta_promos ?? false,
    },
    plan: estadoPlan(perfil?.premium_hasta ?? null),
  };
});

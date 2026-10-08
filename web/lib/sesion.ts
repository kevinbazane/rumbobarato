import 'server-only';
import { cache } from 'react';
import { MODO_DEMO } from './config.ts';
import { estadoPlan, type EstadoPlan } from './plan.ts';
import { supabaseServidor } from './supabase/server.ts';

export interface Sesion {
  usuario: { id: string; email: string; nombre: string | null } | null;
  plan: EstadoPlan;
}

/** Usuario conectado y estado de su plan (una sola consulta por request). */
export const obtenerSesion = cache(async (): Promise<Sesion> => {
  if (MODO_DEMO) return { usuario: null, plan: estadoPlan(null) };

  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { usuario: null, plan: estadoPlan(null) };

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, premium_hasta')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    usuario: {
      id: data.user.id,
      email: data.user.email ?? '',
      nombre: perfil?.nombre ?? (data.user.user_metadata?.full_name as string | undefined) ?? null,
    },
    plan: estadoPlan(perfil?.premium_hasta ?? null),
  };
});

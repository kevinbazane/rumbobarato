import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con la clave de servicio: ignora RLS. Solo para el servidor
 * (publicar ofertas, registrar pagos, mostrar internacionales bloqueadas).
 */
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

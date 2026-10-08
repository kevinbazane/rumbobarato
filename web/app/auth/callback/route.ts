import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServidor } from '@/lib/supabase/server';

/** Vuelta del login con Google o del link mágico del correo. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const codigo = url.searchParams.get('code');
  const siguiente = url.searchParams.get('next') ?? '/';
  const destino = siguiente.startsWith('/') && !siguiente.startsWith('//') ? siguiente : '/';

  if (codigo) {
    const supabase = await supabaseServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(new URL('/ingresar?error=1', url.origin));
}

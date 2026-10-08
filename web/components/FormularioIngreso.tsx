'use client';
import { useState } from 'react';
import { supabaseNavegador } from '@/lib/supabase/navegador';

export function FormularioIngreso({ siguiente }: { siguiente: string }) {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'enviado' | 'error'>('listo');

  const volverA = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(siguiente)}`;

  async function conGoogle() {
    await supabaseNavegador().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: volverA() } });
  }

  async function conCorreo(e: React.FormEvent) {
    e.preventDefault();
    setEstado('enviando');
    const { error } = await supabaseNavegador().auth.signInWithOtp({ email, options: { emailRedirectTo: volverA() } });
    setEstado(error ? 'error' : 'enviado');
  }

  if (estado === 'enviado') {
    return (
      <div className="rounded-2xl bg-selva-50 p-5 text-center">
        <p className="text-3xl">📬</p>
        <p className="mt-2 font-bold text-selva-700">Revisa tu correo</p>
        <p className="mt-1 text-sm text-tinta-600">Te enviamos un link a <b>{email}</b>. Ábrelo en este mismo dispositivo para ingresar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={conGoogle} className="boton-claro w-full py-3.5 text-base">
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-tinta-300">
        <span className="h-px flex-1 bg-tinta-100" /> o con tu correo <span className="h-px flex-1 bg-tinta-100" />
      </div>

      <form onSubmit={conCorreo} className="space-y-3">
        <label htmlFor="email" className="sr-only">Correo electrónico</label>
        <input
          id="email" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com"
          className="campo" value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={estado === 'enviando'} className="boton-primario w-full py-3.5 text-base">
          {estado === 'enviando' ? 'Enviando…' : 'Enviarme un link para ingresar'}
        </button>
        {estado === 'error' && <p role="alert" className="text-sm text-coral-700">No pudimos enviar el correo. Revisa la dirección e inténtalo de nuevo.</p>}
      </form>
    </div>
  );
}

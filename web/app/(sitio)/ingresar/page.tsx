import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FormularioIngreso } from '@/components/FormularioIngreso';
import { Isotipo } from '@/components/Logo';
import { MODO_DEMO } from '@/lib/config';
import { obtenerSesion } from '@/lib/sesion';

export const metadata: Metadata = { title: 'Ingresar' };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function Ingresar({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const siguiente = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const { usuario } = await obtenerSesion();
  if (usuario) redirect(siguiente);

  return (
    <div className="contenedor grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-elevada ring-1 ring-tinta-100/60">
        <Isotipo className="h-12 w-12" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Ingresa a RumboBarato</h1>
        <p className="mt-1 text-sm text-tinta-600">Sin contraseñas. Si es tu primera vez, tu cuenta se crea automáticamente.</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-coral-50 p-3 text-sm text-coral-800">El link expiró o ya fue usado. Pide uno nuevo.</p>}
        <div className="mt-6">
          {MODO_DEMO ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">El ingreso se activa cuando configures Supabase.</p>
          ) : (
            <FormularioIngreso siguiente={siguiente} />
          )}
        </div>
      </div>
    </div>
  );
}

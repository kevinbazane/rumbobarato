import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FormularioWhatsapp } from '@/components/FormularioWhatsapp';
import { PLAN } from '@/lib/config';
import { fechaHora, precio } from '@/lib/formato';
import { obtenerSesion } from '@/lib/sesion';
import { supabaseServidor } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Mi cuenta' };
export const dynamic = 'force-dynamic';

const ESTADOS = {
  free: { texto: 'Plan gratis', clase: 'bg-tinta-50 text-tinta-700' },
  activo: { texto: 'Premium activo', clase: 'bg-selva-50 text-selva-700' },
  por_vencer: { texto: 'Premium por vencer', clase: 'bg-amber-50 text-amber-800' },
  tolerancia: { texto: 'En tolerancia', clase: 'bg-amber-100 text-amber-900' },
  vencido: { texto: 'Premium vencido', clase: 'bg-coral-50 text-coral-700' },
} as const;

export default async function Cuenta() {
  const { usuario, plan } = await obtenerSesion();
  if (!usuario) redirect('/ingresar?next=/cuenta');

  const supabase = await supabaseServidor();
  const { data: pagos } = await supabase
    .from('pagos')
    .select('id, monto, metodo, periodo_desde, periodo_hasta, creado_en')
    .order('creado_en', { ascending: false })
    .limit(24);

  const estado = ESTADOS[plan.tipo];

  return (
    <div className="contenedor max-w-3xl space-y-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hola{usuario.nombre ? `, ${usuario.nombre.split(' ')[0]}` : ''} 👋</h1>
          <p className="text-sm text-tinta-500">{usuario.email}</p>
        </div>
        <form action="/auth/salir" method="post">
          <button className="boton-claro py-2">Cerrar sesión</button>
        </form>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">Tu plan</h2>
          <span className={`etiqueta ${estado.clase}`}>{estado.texto}</span>
        </div>
        <div className="mt-4 text-sm leading-relaxed text-tinta-700">
          {plan.tipo === 'free' && <p>Ves todas las ofertas nacionales. Hazte Premium para desbloquear las internacionales.</p>}
          {(plan.tipo === 'activo' || plan.tipo === 'por_vencer') && (
            <p>Tu plan Premium está activo hasta el <b>{fechaHora(plan.premiumHasta!)}</b> ({plan.diasRestantes} {plan.diasRestantes === 1 ? 'día' : 'días'}).</p>
          )}
          {plan.tipo === 'tolerancia' && (
            <p>Tu plan venció el <b>{fechaHora(plan.premiumHasta!)}</b>. Mantienes el acceso hasta el <b>{fechaHora(plan.toleranciaHasta!)}</b> para que puedas renovar.</p>
          )}
          {plan.tipo === 'vencido' && <p>Tu plan venció el <b>{fechaHora(plan.premiumHasta!)}</b>. Renueva para volver a ver las ofertas internacionales.</p>}
        </div>
        <Link href="/premium" className="boton-primario mt-6">
          {plan.tipo === 'free' ? `Hazte Premium · S/ ${precio(PLAN.precio)}` : `Renovar · S/ ${precio(PLAN.precio)}`}
        </Link>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60 sm:p-8">
        <h2 className="text-xl font-extrabold">Promociones por WhatsApp</h2>
        <p className="mt-1 text-sm text-tinta-600">Déjanos tu número si quieres recibir promociones. Para dejar de recibirlas, desmarca la casilla y guarda.</p>
        <div className="mt-4">
          <FormularioWhatsapp whatsappInicial={usuario.whatsapp} aceptaInicial={usuario.aceptaPromos} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60 sm:p-8">
        <h2 className="text-xl font-extrabold">Historial de pagos</h2>
        {pagos?.length ? (
          <div className="mt-4 divide-y divide-tinta-100">
            {pagos.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-bold">S/ {precio(Number(p.monto))} · {p.metodo === 'yape' ? 'Yape' : 'Mercado Pago'}</p>
                  <p className="text-tinta-500">{fechaHora(p.periodo_desde)} → {fechaHora(p.periodo_hasta)}</p>
                </div>
                <span className="text-xs text-tinta-400">N.° {p.id}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-tinta-500">Todavía no tienes pagos.</p>
        )}
      </section>
    </div>
  );
}

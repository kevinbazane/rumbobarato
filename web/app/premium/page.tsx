import type { Metadata } from 'next';
import Link from 'next/link';
import { IconoCheck, IconoEscudo } from '@/components/Iconos';
import { MediosDePago } from '@/components/MediosDePago';
import { MODO_DEMO, PLAN } from '@/lib/config';
import { fechaHora, precio } from '@/lib/formato';
import { obtenerSesion } from '@/lib/sesion';

export const metadata: Metadata = { title: 'Plan Premium' };
export const dynamic = 'force-dynamic';

const COMPARACION: [string, boolean, boolean][] = [
  ['Ofertas nacionales con precio bajo', true, true],
  ['Guía de viaje de cada destino', true, true],
  ['Canal de WhatsApp gratis', true, true],
  ['Ofertas internacionales (precio, fechas y link)', false, true],
  ['Vuelos a Sudamérica, EE. UU., Europa y Asia', false, true],
];

export default async function Premium() {
  const { usuario, plan } = await obtenerSesion();
  const monto = precio(PLAN.precio);

  return (
    <div className="contenedor grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-16">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-coral-600">RumboBarato Premium</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Todas las ofertas. Dentro y fuera del Perú.</h1>
        <p className="mt-4 max-w-xl text-lg text-tinta-600">
          Por S/ {monto} al mes desbloqueas las ofertas internacionales con precio bajo. Con una sola oferta que aproveches, el plan se paga solo.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-tarjeta ring-1 ring-tinta-100/60">
          <div className="grid grid-cols-[1fr_70px_90px] bg-arena-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-tinta-500 sm:grid-cols-[1fr_90px_110px]">
            <span>Incluye</span><span className="text-center">Gratis</span><span className="text-center text-coral-600">Premium</span>
          </div>
          {COMPARACION.map(([t, gratis, premium]) => (
            <div key={t} className="grid grid-cols-[1fr_70px_90px] items-center border-t border-tinta-100 px-5 py-3.5 text-sm sm:grid-cols-[1fr_90px_110px]">
              <span className="font-medium">{t}</span>
              <span className="text-center">{gratis ? <IconoCheck className="mx-auto h-5 w-5 text-selva-600" /> : <span className="text-tinta-300">—</span>}</span>
              <span className="text-center"><IconoCheck className={`mx-auto h-5 w-5 ${premium ? 'text-coral-500' : 'text-tinta-200'}`} /></span>
            </div>
          ))}
        </div>

        <ul className="mt-8 space-y-3 text-sm text-tinta-600">
          <li className="flex gap-3"><IconoCheck className="h-5 w-5 shrink-0 text-coral-500" /> Pago único por {PLAN.dias} días. Sin débito automático ni contratos.</li>
          <li className="flex gap-3"><IconoCheck className="h-5 w-5 shrink-0 text-coral-500" /> Te avisamos {PLAN.diasAvisoAntes} días antes de que venza, y tienes {PLAN.diasTolerancia} días de tolerancia para renovar.</li>
          <li className="flex gap-3"><IconoCheck className="h-5 w-5 shrink-0 text-coral-500" /> Si renuevas antes de que venza, los días se suman a tu plan actual.</li>
        </ul>
      </section>

      <section>
        <div className="rounded-3xl bg-white p-6 shadow-elevada ring-1 ring-tinta-100/60 sm:p-8 lg:sticky lg:top-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-tinta-500">Plan mensual</p>
              <p className="text-5xl font-extrabold tracking-tight"><span className="text-2xl">S/</span> {monto}</p>
            </div>
            <span className="etiqueta bg-coral-50 text-coral-700">{PLAN.dias} días</span>
          </div>

          {plan.accesoPremium && plan.premiumHasta && (
            <p className="mt-5 rounded-xl bg-selva-50 p-3 text-sm text-selva-700">
              Tu plan está activo hasta el <b>{fechaHora(plan.premiumHasta)}</b>. Si pagas ahora, se suman {PLAN.dias} días más.
            </p>
          )}

          <div className="mt-6">
            {MODO_DEMO ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Los pagos se activan cuando configures Supabase y Mercado Pago.</p>
            ) : usuario ? (
              <MediosDePago monto={monto} />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-tinta-600">Crea tu cuenta gratis o ingresa para suscribirte. Así tu plan queda guardado y lo usas en cualquier dispositivo.</p>
                <Link href="/ingresar?next=/premium" className="boton-primario w-full py-3.5 text-base">Ingresar para suscribirme</Link>
              </div>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 border-t border-tinta-100 pt-5 text-xs text-tinta-500">
            <IconoEscudo className="h-4 w-4" /> Pagos procesados de forma segura por Mercado Pago
          </p>
        </div>
      </section>
    </div>
  );
}

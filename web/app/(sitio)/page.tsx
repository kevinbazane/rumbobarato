import Link from 'next/link';
import { IconoCampana, IconoCandado, IconoCheck, IconoEscudo, IconoMundo, IconoReloj } from '@/components/Iconos';
import { TarjetaOferta } from '@/components/TarjetaOferta';
import { PLAN, WHATSAPP_CANAL } from '@/lib/config';
import { precio } from '@/lib/formato';
import { listarOfertas } from '@/lib/ofertas';
import { obtenerSesion } from '@/lib/sesion';

export const dynamic = 'force-dynamic';

export default async function Inicio() {
  const { plan } = await obtenerSesion();
  const [nacionales, internacionales] = await Promise.all([
    listarOfertas('nacional', plan.accesoPremium),
    listarOfertas('internacional', plan.accesoPremium, 6),
  ]);
  const masBarata = nacionales.reduce<number | null>(
    (min, o) => (!o.bloqueada && (min === null || o.precio < min) ? o.precio : min),
    null,
  );

  return (
    <>
      {/* Portada */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-coral-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-[380px] w-[380px] rounded-full bg-amber-100/80 blur-3xl" />
        <div className="contenedor relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="etiqueta bg-white text-coral-700 shadow-tarjeta ring-1 ring-coral-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-selva-500" /> Ofertas detectadas en tiempo real
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-tinta-900 sm:text-6xl">
              Vuela más.
              <br />
              <span className="text-coral-500">Paga mucho menos.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-tinta-600">
              Revisamos los precios de Google Flights todo el día y te avisamos solo cuando una ruta está realmente
              barata. Vuelos ida y vuelta, directos o con una escala.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#nacionales" className="boton-primario px-6 py-3.5 text-base">Ver ofertas de hoy</Link>
              {!plan.accesoPremium && (
                <Link href="/premium" className="boton-claro px-6 py-3.5 text-base">
                  Premium · S/ {precio(PLAN.precio)}/mes
                </Link>
              )}
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-tinta-400">Ofertas nacionales</dt>
                <dd className="text-2xl font-extrabold">{nacionales.length}</dd>
              </div>
              {masBarata !== null && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-tinta-400">Desde</dt>
                  <dd className="text-2xl font-extrabold">S/ {precio(masBarata)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-tinta-400">Filtro</dt>
                <dd className="text-2xl font-extrabold">Solo precio bajo</dd>
              </div>
            </dl>
          </div>
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {nacionales.slice(0, 2).map((o, i) => (
                <div key={o.id} className={i === 1 ? 'mt-12' : ''}>
                  <TarjetaOferta oferta={o} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nacionales */}
      <section id="nacionales" className="contenedor scroll-mt-24 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">🇵🇪 Dentro del Perú</p>
            <h2 className="titulo-seccion mt-1">Últimas ofertas nacionales</h2>
          </div>
          <p className="text-sm text-tinta-500">Gratis para todos · Se actualiza en automático</p>
        </div>
        {nacionales.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nacionales.map((o) => <TarjetaOferta key={o.id} oferta={o} />)}
          </div>
        ) : (
          <SinOfertas />
        )}
      </section>

      {/* Internacionales */}
      <section id="internacionales" className="contenedor scroll-mt-24 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-cielo-600">🌎 Fuera del Perú</p>
            <h2 className="titulo-seccion mt-1">Ofertas internacionales</h2>
          </div>
          {!plan.accesoPremium && (
            <Link href="/premium" className="inline-flex items-center gap-1.5 text-sm font-bold text-coral-600 hover:text-coral-700">
              <IconoCandado className="h-4 w-4" /> Exclusivas para Premium
            </Link>
          )}
        </div>
        {internacionales.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {internacionales.map((o) => <TarjetaOferta key={o.id} oferta={o} />)}
          </div>
        ) : (
          <SinOfertas />
        )}
      </section>

      {/* Cómo funciona */}
      <section className="contenedor pt-24">
        <h2 className="titulo-seccion text-center">¿Cómo funciona?</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icono: <IconoReloj className="h-6 w-6" />, titulo: 'Vigilamos los precios', texto: 'Seguimos rutas desde Lima y otras ciudades del Perú en Google Flights, las 24 horas.' },
            { icono: <IconoCheck className="h-6 w-6" />, titulo: 'Filtramos lo que vale la pena', texto: 'Solo publicamos tarifas marcadas como "precio bajo", ida y vuelta y con máximo una escala.' },
            { icono: <IconoCampana className="h-6 w-6" />, titulo: 'Te avisamos al toque', texto: 'Cada oferta llega a la web y a nuestro canal de WhatsApp. Tú solo eliges y compras.' },
          ].map((p, i) => (
            <div key={p.titulo} className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral-600">{p.icono}</span>
                <span className="text-5xl font-extrabold text-tinta-100">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-600">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium */}
      {!plan.accesoPremium && (
        <section className="contenedor pt-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-tinta-900 px-6 py-12 text-white sm:px-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-coral-500/40 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-coral-300">RumboBarato Premium</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">El mundo también tiene ofertas.</h2>
                <ul className="mt-6 space-y-3 text-tinta-100">
                  {[
                    'Todas las ofertas internacionales: precio, fechas, aerolínea y link de compra',
                    'Todas las ofertas nacionales, igual que en el plan gratis',
                    'Paga con Yape o con tarjeta, sin contratos ni débito automático',
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <IconoCheck className="mt-0.5 h-5 w-5 shrink-0 text-coral-400" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm text-tinta-300">Plan mensual</p>
                <p className="mt-1 text-5xl font-extrabold">
                  <span className="text-2xl">S/</span> {precio(PLAN.precio)}
                </p>
                <p className="text-sm text-tinta-300">por {PLAN.dias} días de acceso</p>
                <Link href="/premium" className="boton-primario mt-6 w-full py-3.5 text-base">Hazte Premium</Link>
                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-tinta-300">
                  <IconoEscudo className="h-4 w-4" /> Pago seguro con Mercado Pago y Yape
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Preguntas frecuentes */}
      <section className="contenedor max-w-3xl pt-24">
        <h2 className="titulo-seccion text-center">Preguntas frecuentes</h2>
        <div className="mt-8 divide-y divide-tinta-100 rounded-3xl bg-white px-6 shadow-tarjeta ring-1 ring-tinta-100/60">
          {[
            ['¿RumboBarato vende pasajes?', 'No. Encontramos la oferta y te llevamos a Google Flights, donde eliges la aerolínea o agencia y compras directamente con ellos.'],
            ['¿Por qué el precio que veo puede ser distinto?', 'Las aerolíneas cambian sus tarifas constantemente. Publicamos el precio del momento en que lo detectamos; mientras antes entres, más probable es encontrarlo.'],
            ['¿Qué incluye el plan gratis?', 'Todas las ofertas nacionales en la web y en nuestro canal de WhatsApp.'],
            ['¿El plan Premium se renueva solo?', `No. Pagas S/ ${precio(PLAN.precio)} por ${PLAN.dias} días. Te avisamos antes de que venza y tienes ${PLAN.diasTolerancia} días de tolerancia para renovar sin perder el acceso.`],
            ['¿Cómo pago?', 'Con Yape (solo necesitas tu celular y el código de aprobación de la app) o con tarjeta de crédito o débito mediante Mercado Pago.'],
          ].map(([p, r]) => (
            <details key={p} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                {p}
                <span className="text-xl text-coral-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-tinta-600">{r}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function SinOfertas() {
  return (
    <div className="mt-6 rounded-3xl border-2 border-dashed border-tinta-100 bg-white/60 p-10 text-center">
      <IconoMundo className="mx-auto h-8 w-8 text-tinta-300" />
      <p className="mt-3 font-bold">Por ahora no hay ofertas activas</p>
      <p className="mt-1 text-sm text-tinta-500">
        Estamos vigilando los precios. Vuelve pronto o{' '}
        <a href={WHATSAPP_CANAL} target="_blank" rel="noopener noreferrer" className="font-bold text-[#128C4B] underline">únete a nuestro canal de WhatsApp</a>.
      </p>
    </div>
  );
}

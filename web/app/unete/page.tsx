import type { Metadata } from 'next';
import { IconoCalendario, IconoCampana, IconoCheck, IconoEscudo, IconoReloj } from '@/components/Iconos';
import { BarraFija } from '@/components/landing/BarraFija';
import { BotonCanal } from '@/components/landing/BotonCanal';
import { TelefonoAlerta } from '@/components/landing/TelefonoAlerta';
import { Logo } from '@/components/Logo';
import { FotoDestino } from '@/components/FotoDestino';
import { EMPRESA } from '@/lib/config';
import { OFERTAS_DEMO } from '@/lib/demo';
import { fechaCorta, haceCuanto, precio, textoEscalas } from '@/lib/formato';
import { listarOfertas } from '@/lib/ofertas';
import type { Oferta } from '@/lib/tipos';

export const metadata: Metadata = {
  title: 'Vuelos baratos en Perú, directo a tu WhatsApp',
  description: 'Únete gratis al canal de WhatsApp de RumboBarato y recibe al toque las tarifas bajas para viajar por el Perú. Sin registrarte y sin spam.',
  openGraph: {
    title: 'Vuelos baratos en Perú, directo a tu WhatsApp ✈',
    description: 'Te avisamos cuando una ruta baja de precio. Gratis, sin registrarte.',
  },
};

// Se regenera cada 10 minutos: rápida para anuncios y con las ofertas al día.
export const revalidate = 600;

const DESTINOS = ['Cusco', 'Arequipa', 'Iquitos', 'Piura', 'Tarapoto', 'Trujillo', 'Cajamarca', 'Chiclayo', 'Tumbes', 'Puerto Maldonado', 'Ayacucho', 'Juliaca', 'Tacna', 'Pucallpa'];

export default async function Unete() {
  const reales = (await listarOfertas('nacional', false, 9).catch(() => [])) as Oferta[];
  const hayReales = reales.length > 0;
  const ofertas = hayReales ? reales : OFERTAS_DEMO.filter((o) => o.alcance === 'nacional');
  const destacada = ofertas[0];
  const masBarata = Math.min(...ofertas.map((o) => o.precio));

  return (
    <div className="overflow-x-clip bg-arena-100">
      {/* Encabezado mínimo: solo marca y botón, sin salidas */}
      <header className="sticky top-0 z-40 border-b border-tinta-100/60 bg-arena-100/85 backdrop-blur-md">
        <div className="contenedor flex h-14 items-center justify-between">
          <Logo />
          <BotonCanal texto="Unirme" compacto />
        </div>
      </header>

      {/* Portada */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-coral-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-64 h-[360px] w-[360px] rounded-full bg-[#25D366]/15 blur-3xl" />
        <div className="contenedor relative grid items-center gap-12 pb-16 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-16">
          <div className="text-center lg:text-left">
            <span className="etiqueta animate-aparecer bg-white text-tinta-700 shadow-tarjeta ring-1 ring-tinta-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#25D366]" />
              {hayReales ? `Última alerta ${haceCuanto(destacada.creado_en)}` : 'Alertas en tiempo real'}
            </span>
            <h1 className="mt-5 animate-aparecer text-[2.35rem] font-extrabold leading-[1.05] tracking-tight text-tinta-900 [animation-delay:.08s] sm:text-6xl">
              Pasajes baratos por el Perú,{' '}
              <span className="relative text-coral-500 sm:whitespace-nowrap">
                directo a tu WhatsApp
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 9c60-6 150-8 296-3" stroke="#FF9C80" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl animate-aparecer text-lg leading-relaxed text-tinta-600 [animation-delay:.16s] lg:mx-0">
              Vigilamos los precios de los vuelos todo el día y te avisamos <b className="text-tinta-900">solo cuando una ruta está realmente barata</b>. Tú solo eliges y compras.
            </p>
            <div className="mt-8 flex animate-aparecer flex-col items-center gap-3 [animation-delay:.24s] lg:items-start">
              <BotonCanal latido className="w-full max-w-sm text-lg sm:w-auto" />
              <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-medium text-tinta-500">
                <span>✓ 100% gratis</span><span>✓ Sin registrarte</span><span>✓ Sales cuando quieras</span>
              </p>
            </div>
          </div>
          <div className="pt-6 lg:pt-0">
            <TelefonoAlerta oferta={destacada} />
          </div>
        </div>

        {/* Destinos en movimiento */}
        <div className="relative overflow-hidden border-y border-tinta-100 bg-white py-4" aria-hidden="true">
          <div className="flex w-max animate-desfile gap-10 whitespace-nowrap text-lg font-extrabold text-tinta-200">
            {[...DESTINOS, ...DESTINOS].map((d, i) => (
              <span key={i} className="flex items-center gap-10">{d}<span className="text-coral-300">✈</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas reales */}
      <section className="contenedor py-16">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-coral-600">{hayReales ? 'Detectadas estos días' : 'Así se ven las alertas'}</p>
          <h2 className="titulo-seccion mt-1">
            {hayReales ? <>Vuelos desde <span className="text-coral-500">S/ {precio(masBarata)}</span> ida y vuelta</> : 'Ofertas como estas llegan al canal'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-tinta-600">
            {hayReales
              ? 'Estas tarifas las enviamos al canal apenas las detectamos. Quien estaba unido las vio primero.'
              : 'Ejemplos del tipo de tarifas que publicamos en el canal.'}
          </p>
        </div>
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {ofertas.slice(0, 6).map((o) => (
            <article key={o.id} className="w-[78%] shrink-0 snap-center overflow-hidden rounded-3xl bg-white shadow-tarjeta ring-1 ring-tinta-100/60 sm:w-auto">
              <div className="relative aspect-[16/10]">
                <FotoDestino imagen={o.imagenes[0]} nombre={o.destino_nombre} className="h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-tinta-900/75 via-transparent" />
                <span className="etiqueta absolute left-3 top-3 bg-selva-500 text-white">↓ Precio bajo</span>
                <div className="absolute bottom-3 left-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{o.origen_nombre} →</p>
                  <p className="text-2xl font-extrabold text-white">{o.destino_nombre}</p>
                </div>
              </div>
              <div className="flex items-end justify-between p-4">
                <div>
                  <p className="text-xs text-tinta-400">{fechaCorta(o.fecha_ida)} – {fechaCorta(o.fecha_vuelta)} · {textoEscalas(o.escalas)}</p>
                  <p className="text-3xl font-extrabold tracking-tight"><span className="text-lg">S/</span> {precio(o.precio)}</p>
                </div>
                <span className="text-xs text-tinta-400">{hayReales ? haceCuanto(o.creado_en) : 'Ejemplo'}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <BotonCanal texto="Quiero recibir las próximas" />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-white py-16">
        <div className="contenedor">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">Así de fácil</p>
            <h2 className="titulo-seccion mt-1">Únete en 10 segundos</h2>
          </div>
          <ol className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              { n: '1', titulo: 'Toca el botón verde', texto: 'Se abre WhatsApp directo en el canal de RumboBarato.' },
              { n: '2', titulo: 'Toca "Seguir"', texto: 'Listo, ya estás dentro. No tienes que escribir nada ni dar tu correo.' },
              { n: '3', titulo: 'Activa la campanita 🔔', texto: 'Así te llega la notificación apenas publicamos una oferta y no te la pierdes.' },
            ].map((p) => (
              <li key={p.n} className="relative rounded-3xl bg-arena-100 p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#25D366] text-xl font-extrabold text-[#06371C]">{p.n}</span>
                <h3 className="mt-4 text-lg font-extrabold">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-tinta-600">{p.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <BotonCanal />
          </div>
        </div>
      </section>

      {/* Qué es un canal (privacidad) */}
      <section className="contenedor py-16">
        <div className="grid items-center gap-10 rounded-[2rem] bg-tinta-900 p-6 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-300">Tranquilo, no es un grupo</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Es un canal de WhatsApp: tú solo recibes.</h2>
            <p className="mt-4 leading-relaxed text-tinta-200">
              Los canales son la función de WhatsApp para recibir novedades sin ruido. Nadie te agrega a chats ni te escribe.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { icono: <IconoEscudo className="h-5 w-5" />, t: 'Tu número es privado', d: 'Ni nosotros ni los demás seguidores lo pueden ver.' },
              { icono: <IconoCampana className="h-5 w-5" />, t: 'Cero mensajes de otras personas', d: 'Solo llegan nuestras alertas de vuelos.' },
              { icono: <IconoCheck className="h-5 w-5" />, t: 'Sales con un toque', d: 'Si un día ya no lo quieres, tocas "Dejar de seguir" y listo.' },
            ].map((b) => (
              <li key={b.t} className="flex gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral-500 text-white">{b.icono}</span>
                <div>
                  <p className="font-bold">{b.t}</p>
                  <p className="text-sm text-tinta-300">{b.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Qué hace diferente a una alerta */}
      <section className="contenedor pb-16">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-coral-600">Por qué funciona</p>
          <h2 className="titulo-seccion mt-1">No te mandamos cualquier precio</h2>
          <p className="mx-auto mt-3 max-w-xl text-tinta-600">Cada alerta pasa un filtro antes de llegar a tu WhatsApp:</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { e: '📉', t: 'Solo precio bajo', d: 'Publicamos únicamente tarifas que Google Flights marca como más baratas de lo habitual.' },
            { e: '🔁', t: 'Ida y vuelta', d: 'Precio real del viaje completo, no solo de un tramo.' },
            { e: '🛫', t: 'Directo o 1 escala', d: 'Nada de viajes eternos con varias conexiones.' },
            { e: '🇵🇪', t: 'Destinos del Perú', d: 'Cusco, Arequipa, Iquitos, Piura, Tarapoto y muchos más.' },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60">
              <span className="text-3xl">{f.e}</span>
              <h3 className="mt-3 text-lg font-extrabold">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-tinta-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consejos para aprovechar */}
      <section className="bg-white py-16">
        <div className="contenedor grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">Tip de viajero</p>
            <h2 className="titulo-seccion mt-1">Cómo aprovechar una alerta al máximo</h2>
            <p className="mt-3 text-tinta-600">Las tarifas bajas se agotan rápido. Con estos tres hábitos vas a ser de los primeros en comprar.</p>
          </div>
          <ol className="space-y-4">
            {[
              { icono: <IconoReloj className="h-5 w-5" />, t: 'Entra apenas llegue la notificación', d: 'Los precios bajos pueden durar solo unas horas.' },
              { icono: <IconoCalendario className="h-5 w-5" />, t: 'Ten tus fechas libres en mente', d: 'Si la oferta coincide con tus vacaciones o un feriado largo, no lo pienses tanto.' },
              { icono: <IconoCheck className="h-5 w-5" />, t: 'Revisa el equipaje antes de pagar', d: 'Las tarifas low cost suelen cobrar la maleta aparte: súmala para comparar bien.' },
            ].map((c, i) => (
              <li key={c.t} className="flex gap-4 rounded-2xl border border-tinta-100 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">{c.icono}</span>
                <div>
                  <p className="font-bold"><span className="text-coral-500">{i + 1}.</span> {c.t}</p>
                  <p className="mt-1 text-sm text-tinta-600">{c.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="contenedor max-w-3xl py-16">
        <h2 className="titulo-seccion text-center">Preguntas frecuentes</h2>
        <div className="mt-8 divide-y divide-tinta-100 rounded-3xl bg-white px-6 shadow-tarjeta ring-1 ring-tinta-100/60">
          {[
            ['¿Cuánto cuesta?', 'Nada. El canal de ofertas nacionales es 100% gratis.'],
            ['¿Tengo que registrarme o dar mi correo?', 'No. Solo tocas "Seguir" en WhatsApp. No pedimos correo, DNI ni ningún dato.'],
            ['¿Pueden ver mi número?', 'No. En los canales de WhatsApp tu número no es visible para nosotros ni para los demás seguidores.'],
            ['¿Cada cuánto llegan ofertas?', 'Cuando aparece una tarifa baja de verdad. Algunos días llegan varias y otros ninguna: preferimos avisarte poco y bien.'],
            ['¿Ustedes venden los pasajes?', 'No. Te llevamos a la oferta y compras directo en la aerolínea o la agencia que elijas desde Google Flights.'],
            ['¿Y vuelos internacionales?', 'También los detectamos. Están en el plan Premium de nuestra web, por S/ 9.90 al mes.'],
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

      {/* Cierre */}
      <section className="contenedor pb-28 sm:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-coral-500 to-coral-700 px-6 py-14 text-center text-white">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">Tu próximo viaje puede costar mucho menos.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-coral-50">Únete hoy y recibe la próxima oferta antes que los demás.</p>
          <BotonCanal latido className="relative mt-8 w-full max-w-sm text-lg sm:w-auto" />
          <p className="relative mt-3 text-sm text-coral-100">Gratis · Sin registrarte · Sin spam</p>
        </div>
        <p className="mt-8 text-center text-xs text-tinta-400">
          © {new Date().getFullYear()} RumboBarato · {EMPRESA.razonSocial} · RUC {EMPRESA.ruc}. Los precios provienen de Google Flights al momento de la detección y pueden cambiar sin aviso.
        </p>
        <nav className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-tinta-500">
          <a href="/terminos" className="underline">Términos y condiciones</a>
          <a href="/privacidad" className="underline">Política de privacidad</a>
          <a href="/libro-de-reclamaciones" className="underline">Libro de Reclamaciones</a>
        </nav>
      </section>

      <BarraFija />
    </div>
  );
}

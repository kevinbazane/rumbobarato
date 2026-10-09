import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonCompartir } from '@/components/BotonCompartir';
import { FotoDestino } from '@/components/FotoDestino';
import {
  IconoAvion, IconoBombilla, IconoCalendario, IconoCandado, IconoCheck, IconoExterno,
  IconoMapa, IconoMontana, IconoMundo, IconoReloj, IconoSol,
} from '@/components/Iconos';
import { TarjetaOferta } from '@/components/TarjetaOferta';
import { PLAN, SITIO } from '@/lib/config';
import { CONSEJOS_COMPRA, guiaDestino } from '@/lib/destinos';
import { fechaCorta, fechaHora, fechaLarga, haceCuanto, noches, precio, textoEscalas } from '@/lib/formato';
import { resumenWikipedia } from '@/lib/imagenes';
import { obtenerOferta, otrasOfertas } from '@/lib/ofertas';
import { obtenerSesion } from '@/lib/sesion';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ codigo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const o = await obtenerOferta(codigo);
  if (!o) return { title: 'Oferta no encontrada' };
  const titulo =
    o.alcance === 'nacional'
      ? `${o.origen_nombre} → ${o.destino_nombre} desde S/ ${precio(o.precio)} ida y vuelta`
      : `${o.origen_nombre} → ${o.destino_nombre}: oferta internacional`;
  return {
    title: titulo,
    description: `Tarifa baja detectada por RumboBarato. ${o.alcance === 'nacional' ? `${o.aerolinea}, ${textoEscalas(o.escalas).toLowerCase()}.` : 'Exclusiva para Premium.'}`,
    openGraph: { title: titulo, images: o.imagenes[0] ? [{ url: o.imagenes[0].url }] : undefined },
  };
}

export default async function PaginaOferta({ params }: Props) {
  const { codigo } = await params;
  const oferta = await obtenerOferta(codigo);
  if (!oferta) notFound();

  const { usuario, plan } = await obtenerSesion();
  const internacional = oferta.alcance === 'internacional';
  const bloqueada = internacional && !plan.accesoPremium;
  const guia = guiaDestino(oferta.destino_nombre, internacional);
  const otras = await otrasOfertas(oferta, plan.accesoPremium);
  const url = `${SITIO.url}/o/${oferta.codigo}`;
  // Sin guía escrita: se presenta el destino con el resumen de Wikipedia.
  const descripcion = guia.generica ? ((await resumenWikipedia(guia.fotos.wikipedia)) ?? guia.descripcion) : guia.descripcion;
  const textoCompartir = internacional
    ? [
        '✈️ ¡Mira esta oferta internacional que encontré en RumboBarato!',
        '',
        `🌎 ${oferta.origen_nombre} → ${oferta.destino_nombre}`,
        '🔥 Precio bajo detectado en Google Flights',
        '',
        'Mira el precio, las fechas y cómo comprarla aquí:',
      ].join('\n')
    : [
        '✈️ ¡Mira esta oferta que encontré en RumboBarato!',
        '',
        `🇵🇪 ${oferta.origen_nombre} → ${oferta.destino_nombre}`,
        `💰 Desde S/ ${precio(oferta.precio)} ida y vuelta`,
        `📅 ${fechaCorta(oferta.fecha_ida)} – ${fechaCorta(oferta.fecha_vuelta)}`,
        `🛫 ${oferta.aerolinea} · ${textoEscalas(oferta.escalas)}`,
        '',
        '⚡ Las tarifas bajas duran poco. Mírala aquí:',
      ].join('\n');

  return (
    <>
      {/* Portada con foto */}
      <section className="relative">
        <div className="relative h-[46vh] max-h-[560px] min-h-[320px] w-full overflow-hidden sm:h-[52vh]">
          <FotoDestino imagen={oferta.imagenes[0]} nombre={oferta.destino_nombre} className="h-full w-full" prioridad />
          <div className="absolute inset-0 bg-gradient-to-t from-tinta-900/90 via-tinta-900/30 to-tinta-900/10" />
          <div className="contenedor absolute inset-x-0 bottom-0 pb-24 sm:pb-28">
            <div className="flex flex-wrap gap-2">
              {!bloqueada && <span className="etiqueta bg-selva-500 text-white">↓ Precio bajo</span>}
              <span className={`etiqueta ${internacional ? 'bg-cielo-500 text-white' : 'bg-white text-tinta-800'}`}>
                {internacional ? '🌎 Internacional' : '🇵🇪 Nacional'}
              </span>
              <span className="etiqueta bg-black/30 text-white backdrop-blur">
                <IconoReloj className="h-3.5 w-3.5" /> Detectada {haceCuanto(oferta.creado_en)}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-white/80">
              {guia.generica ? `Desde ${oferta.origen_nombre}` : `${oferta.origen_nombre} → ${guia.region}`}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">{oferta.destino_nombre}</h1>
            <p className="mt-1 text-lg text-white/85">{guia.lema}</p>
          </div>
        </div>
        {oferta.imagenes[0] && (
          <a
            href={oferta.imagenes[0].enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-2 rounded bg-black/25 px-1.5 py-0.5 text-[10px] text-white/70 hover:text-white"
          >
            {oferta.imagenes[0].credito}
          </a>
        )}
      </section>

      <div className="contenedor relative -mt-16 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Columna principal */}
        <div className="order-2 space-y-8 lg:order-1">
          {/* Datos del vuelo */}
          <section className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60 sm:p-8">
            <h2 className="text-xl font-extrabold">Detalles del vuelo</h2>
            {bloqueada ? (
              <Bloqueo />
            ) : (
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Dato icono={<IconoCalendario />} titulo="Ida" valor={fechaLarga(oferta.fecha_ida)} />
                <Dato icono={<IconoCalendario />} titulo="Vuelta" valor={fechaLarga(oferta.fecha_vuelta)} />
                <Dato icono={<IconoAvion />} titulo="Aerolínea" valor={oferta.aerolinea} />
                <Dato icono={<IconoMapa />} titulo="Escalas" valor={textoEscalas(oferta.escalas)} />
                <Dato icono={<IconoSol />} titulo="Duración del viaje" valor={`${noches(oferta.fecha_ida, oferta.fecha_vuelta)} noches`} />
                <Dato
                  icono={<IconoReloj />}
                  titulo="Ruta"
                  valor={`${oferta.origen_nombre}${oferta.origen_codigo ? ` (${oferta.origen_codigo})` : ''} ⇄ ${oferta.destino_nombre}${oferta.destino_codigo ? ` (${oferta.destino_codigo})` : ''}`}
                />
              </dl>
            )}
          </section>

          {/* Guía del destino */}
          <section className="rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">Guía de viaje</p>
            <h2 className="mt-1 text-2xl font-extrabold">Qué saber de {guia.nombre}</h2>
            <p className="mt-4 leading-relaxed text-tinta-700">{descripcion}</p>

            {!guia.generica && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Mini icono={<IconoCalendario className="h-5 w-5" />} titulo="Mejor época" texto={guia.mejorEpoca} />
                <Mini icono={<IconoSol className="h-5 w-5" />} titulo="Clima" texto={guia.clima} />
                <Mini icono={<IconoMontana className="h-5 w-5" />} titulo="Altura" texto={guia.altura ?? 'Sin efectos de altura importantes.'} />
              </div>
            )}

            {internacional && (guia.documento || guia.moneda || guia.idioma) && (
              <div className="mt-6 rounded-2xl bg-cielo-50 p-5">
                <p className="flex items-center gap-2 text-sm font-extrabold text-cielo-600">
                  <IconoMundo className="h-5 w-5" /> Antes de viajar
                </p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  {guia.documento && (
                    <div className="sm:col-span-3">
                      <dt className="text-xs font-bold uppercase tracking-wider text-tinta-400">Documentos</dt>
                      <dd className="mt-0.5 text-tinta-800">{guia.documento}</dd>
                    </div>
                  )}
                  {guia.moneda && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-tinta-400">Moneda</dt>
                      <dd className="mt-0.5 font-semibold text-tinta-800">{guia.moneda}</dd>
                    </div>
                  )}
                  {guia.idioma && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-tinta-400">Idioma</dt>
                      <dd className="mt-0.5 font-semibold text-tinta-800">{guia.idioma}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-3 text-xs text-tinta-500">Los requisitos de ingreso pueden cambiar: confírmalos con la aerolínea o el consulado antes de viajar.</p>
              </div>
            )}

            {guia.imperdibles.length > 0 && (
              <>
                <h3 className="mt-8 text-lg font-extrabold">Imperdibles</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {guia.imperdibles.map((i, n) => (
                    <div key={i.titulo} className="flex gap-4 rounded-2xl bg-arena-100 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-coral-500 text-sm font-extrabold text-white">{n + 1}</span>
                      <div>
                        <p className="font-bold">{i.titulo}</p>
                        <p className="mt-1 text-sm leading-relaxed text-tinta-600">{i.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 className="mt-8 text-lg font-extrabold">Recomendaciones</h3>
            <ul className="mt-4 space-y-3">
              {[...guia.consejos, ...CONSEJOS_COMPRA.slice(1, 3)].map((c) => (
                <li key={c} className="flex gap-3 text-sm leading-relaxed text-tinta-700">
                  <IconoBombilla className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" /> {c}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-3 rounded-2xl border border-tinta-100 p-4">
              <IconoAvion className="mt-0.5 h-5 w-5 shrink-0 text-tinta-400" />
              <p className="text-sm text-tinta-700"><span className="font-bold">Al llegar: </span>{guia.desdeAeropuerto}</p>
            </div>
          </section>

          {/* Galería (si hay varias fotos) */}
          {oferta.imagenes.length > 1 && (
            <section className="grid grid-cols-3 gap-3">
              {oferta.imagenes.slice(1, 4).map((img) => (
                <a key={img.url} href={img.enlace} target="_blank" rel="noopener noreferrer" title={img.credito} className="overflow-hidden rounded-2xl">
                  <FotoDestino imagen={img} nombre={oferta.destino_nombre} className="aspect-square w-full transition hover:scale-105" />
                </a>
              ))}
            </section>
          )}
        </div>

        {/* Tarjeta de precio (fija al hacer scroll en escritorio) */}
        <aside className="order-1 lg:order-2">
          <div className="rounded-3xl bg-white p-6 shadow-elevada ring-1 ring-tinta-100/60 lg:sticky lg:top-24">
            {bloqueada ? (
              <>
                <div className="flex items-center gap-2 text-sm font-bold text-coral-600">
                  <IconoCandado className="h-4 w-4" /> Oferta Premium
                </div>
                <p className="mt-3 select-none text-4xl font-extrabold blur-[7px]" aria-hidden="true">S/ 1,234</p>
                <p className="mt-2 text-sm text-tinta-600">
                  Hazte Premium para ver el precio, las fechas y el link para comprar esta oferta.
                </p>
                <Link href={usuario ? '/premium' : `/ingresar?next=/o/${oferta.codigo}`} className="boton-primario mt-6 w-full py-3.5 text-base">
                  Desbloquear por S/ {precio(PLAN.precio)}/mes
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-tinta-500">Ida y vuelta desde</p>
                <p className="text-5xl font-extrabold tracking-tight">
                  <span className="text-2xl">S/</span> {precio(oferta.precio)}
                </p>
                <p className="mt-1 text-sm text-tinta-500">por persona · {oferta.aerolinea} · {textoEscalas(oferta.escalas).toLowerCase()}</p>
                <a
                  href={oferta.link_google_flights}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-primario mt-6 w-full py-4 text-base"
                >
                  Ver y comprar en Google Flights <IconoExterno className="h-4 w-4" />
                </a>
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
                  ⚡ Esta tarifa puede subir en cualquier momento.
                </p>
              </>
            )}
            <div className="mt-5">
              <BotonCompartir
                texto={textoCompartir}
                url={url}
              />
            </div>
            <ul className="mt-5 space-y-2 border-t border-tinta-100 pt-5 text-xs text-tinta-500">
              <li className="flex gap-2"><IconoCheck className="h-4 w-4 text-selva-600" /> Marcada como precio bajo por Google Flights</li>
              <li className="flex gap-2"><IconoCheck className="h-4 w-4 text-selva-600" /> Detectada el {fechaHora(oferta.creado_en, true)}</li>
            </ul>
          </div>
        </aside>
      </div>

      {otras.length > 0 && (
        <section className="contenedor pt-16">
          <h2 className="titulo-seccion">Más ofertas nacionales</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {otras.map((o) => <TarjetaOferta key={o.id} oferta={o} />)}
          </div>
        </section>
      )}
    </>
  );
}

function Dato({ icono, titulo, valor }: { icono: React.ReactNode; titulo: string; valor: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-arena-100 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-coral-500 shadow-sm">{icono}</span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-tinta-400">{titulo}</dt>
        <dd className="mt-0.5 font-bold first-letter:uppercase">{valor}</dd>
      </div>
    </div>
  );
}

function Mini({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div className="rounded-2xl border border-tinta-100 p-4">
      <div className="flex items-center gap-2 text-coral-600">{icono}<span className="text-xs font-bold uppercase tracking-wider">{titulo}</span></div>
      <p className="mt-2 text-sm leading-relaxed text-tinta-700">{texto}</p>
    </div>
  );
}

function Bloqueo() {
  return (
    <div className="mt-6 grid place-items-center rounded-2xl border-2 border-dashed border-tinta-100 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral-600"><IconoCandado className="h-6 w-6" /></span>
      <p className="mt-4 font-bold">Fechas, aerolínea y escalas solo para Premium</p>
      <p className="mt-1 max-w-sm text-sm text-tinta-500">
        Las ofertas internacionales son exclusivas del plan Premium. Las nacionales siempre son gratis.
      </p>
      <Link href="/premium" className="boton-oscuro mt-5">Ver plan Premium</Link>
    </div>
  );
}

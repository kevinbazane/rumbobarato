import Link from 'next/link';
import { fechaCorta, haceCuanto, noches, precio, textoEscalas } from '@/lib/formato';
import type { OfertaVisible } from '@/lib/tipos';
import { FotoDestino } from './FotoDestino';
import { IconoAvion, IconoCalendario, IconoCandado } from './Iconos';

export function TarjetaOferta({ oferta }: { oferta: OfertaVisible }) {
  const internacional = oferta.alcance === 'internacional';

  return (
    <Link
      href={`/o/${oferta.codigo}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-tarjeta ring-1 ring-tinta-100/60 transition hover:-translate-y-1 hover:shadow-elevada"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <FotoDestino
          imagen={oferta.imagenes[0]}
          nombre={oferta.destino_nombre}
          className={`h-full w-full transition duration-500 group-hover:scale-105 ${oferta.bloqueada ? 'blur-[2px] brightness-75' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tinta-900/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {oferta.bloqueada ? (
            <span className="etiqueta bg-tinta-900/80 text-white backdrop-blur"><IconoCandado className="h-3.5 w-3.5" /> Premium</span>
          ) : (
            <span className="etiqueta bg-selva-500 text-white">↓ Precio bajo</span>
          )}
          <span className={`etiqueta backdrop-blur ${internacional ? 'bg-cielo-500/90 text-white' : 'bg-white/90 text-tinta-800'}`}>
            {internacional ? 'Internacional' : 'Nacional'}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{oferta.origen_nombre} →</p>
          <p className="text-2xl font-extrabold leading-tight text-white drop-shadow">{oferta.destino_nombre}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {oferta.bloqueada ? (
          <>
            <p className="text-sm text-tinta-500">Precio, fechas y aerolínea disponibles solo para miembros Premium.</p>
            <div className="mt-auto flex items-end justify-between">
              <div>
                <p className="text-xs text-tinta-400">Ida y vuelta desde</p>
                <p className="select-none text-2xl font-extrabold text-tinta-900 blur-[6px]" aria-hidden="true">S/ 1,234</p>
              </div>
              <span className="text-sm font-bold text-coral-600">Desbloquear →</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tinta-600">
              <span className="inline-flex items-center gap-1.5">
                <IconoCalendario className="h-4 w-4 text-tinta-400" />
                {fechaCorta(oferta.fecha_ida)} – {fechaCorta(oferta.fecha_vuelta)}
              </span>
              <span className="text-tinta-300">·</span>
              <span>{noches(oferta.fecha_ida, oferta.fecha_vuelta)} noches</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-tinta-600">
              <IconoAvion className="h-4 w-4 text-tinta-400" />
              {oferta.aerolinea} · {textoEscalas(oferta.escalas)}
            </div>
            <div className="mt-auto flex items-end justify-between border-t border-dashed border-tinta-100 pt-3">
              <div>
                <p className="text-xs text-tinta-400">Ida y vuelta desde</p>
                <p className="text-3xl font-extrabold tracking-tight text-tinta-900">
                  <span className="text-lg font-bold">S/</span> {precio(oferta.precio)}
                </p>
              </div>
              <span className="text-xs text-tinta-400">{haceCuanto(oferta.creado_en)}</span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

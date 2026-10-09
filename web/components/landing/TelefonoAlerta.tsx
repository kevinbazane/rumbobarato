import { SITIO } from '@/lib/config';
import { fechaCorta, haceCuanto, precio } from '@/lib/formato';
import type { Oferta } from '@/lib/tipos';
import { Isotipo } from '../Logo';

/**
 * Teléfono con el Canal de WhatsApp abierto, mostrando una alerta real
 * con el mismo formato del mensaje que se publica en el canal.
 */
export function TelefonoAlerta({ oferta }: { oferta: Oferta }) {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px]">
      {/* Notificación flotante */}
      <div className="absolute -left-4 -top-14 z-20 w-[285px] animate-aparecer rounded-2xl bg-white/95 p-3 shadow-elevada ring-1 ring-tinta-100 backdrop-blur [animation-delay:.6s] sm:-left-16">
        <div className="flex items-center gap-2">
          <Isotipo className="h-7 w-7" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-tinta-900">RumboBarato · ahora</p>
            <p className="truncate text-xs text-tinta-600">
              🔥 {oferta.origen_nombre} → {oferta.destino_nombre} desde S/ {precio(oferta.precio)}
            </p>
          </div>
        </div>
      </div>

      {/* Teléfono */}
      <div className="relative animate-flotar rounded-[2.6rem] bg-tinta-900 p-2.5 shadow-elevada">
        <div className="overflow-hidden rounded-[2.1rem] bg-[#EFE7DE]">
          {/* Barra del canal */}
          <div className="flex items-center gap-2.5 bg-[#075E54] px-4 pb-3 pt-7 text-white">
            <Isotipo className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">RumboBarato</p>
              <p className="text-[11px] text-white/75">Canal · Vuelos baratos en Perú</p>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">Siguiendo</span>
          </div>

          {/* Mensaje */}
          <div className="space-y-3 px-3 py-4">
            <p className="mx-auto w-fit rounded-md bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-tinta-500">ÚLTIMA ALERTA</p>
            <div className="max-w-[94%] rounded-xl rounded-tl-sm bg-white p-3 text-[12.5px] leading-[1.45] text-tinta-900 shadow-sm">
              <p className="font-bold">🇵🇪 ¡Oferta nacional detectada!</p>
              <p className="mt-2 font-semibold">{oferta.origen_nombre} → {oferta.destino_nombre}</p>
              <p>Desde <b>S/ {precio(oferta.precio)}</b> ida y vuelta</p>
              <p className="mt-2">Fechas: {fechaCorta(oferta.fecha_ida)} – {fechaCorta(oferta.fecha_vuelta)}</p>
              <p>Aerolínea: {oferta.aerolinea}</p>
              <p className="mt-2">Esta tarifa puede subir en cualquier momento.</p>
              <p className="mt-2">👉 Ver y comprar: <span className="text-[#027EB5] underline">{new URL(SITIO.url).host}/o/…</span></p>
              <p className="mt-1.5 text-right text-[10px] text-tinta-400">{haceCuanto(oferta.creado_en)}</p>
            </div>
          </div>
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}

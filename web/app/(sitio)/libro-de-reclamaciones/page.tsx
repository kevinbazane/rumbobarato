import type { Metadata } from 'next';
import { FormularioReclamo } from '@/components/FormularioReclamo';
import { IconoLibro } from '@/components/Iconos';
import { EMPRESA } from '@/lib/config';

export const metadata: Metadata = { title: 'Libro de Reclamaciones' };
// La fecha que se muestra es la del día de la visita.
export const dynamic = 'force-dynamic';

export default function LibroDeReclamaciones() {
  const hoy = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'America/Lima' }).format(new Date());

  return (
    <div className="contenedor max-w-3xl py-12">
      <div className="flex items-center gap-4 print:hidden">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-tinta-900 text-white"><IconoLibro className="h-7 w-7" /></span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Libro de Reclamaciones</h1>
          <p className="text-sm text-tinta-500">Conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571).</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-x-6 gap-y-2 rounded-2xl bg-white p-5 text-sm shadow-tarjeta ring-1 ring-tinta-100/60 sm:grid-cols-[150px_1fr] print:hidden">
        <dt className="text-tinta-500">Proveedor</dt><dd className="font-semibold">{EMPRESA.razonSocial} ({EMPRESA.marca})</dd>
        <dt className="text-tinta-500">RUC</dt><dd className="font-semibold">{EMPRESA.ruc}</dd>
        <dt className="text-tinta-500">Domicilio</dt><dd className="font-semibold">{EMPRESA.domicilio}</dd>
        <dt className="text-tinta-500">Fecha</dt><dd className="font-semibold">{hoy}</dd>
      </dl>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-tarjeta ring-1 ring-tinta-100/60 sm:p-8 print:shadow-none print:ring-0">
        <FormularioReclamo empresa={EMPRESA} />
      </div>

      <div className="mt-6 space-y-2 text-xs leading-relaxed text-tinta-500 print:hidden">
        <p>
          <b>Reclamo:</b> disconformidad relacionada a los productos o servicios. <b>Queja:</b> disconformidad no relacionada a los productos o
          servicios, o malestar o descontento respecto a la atención al público.
        </p>
        <p>
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia
          ante el INDECOPI. El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles improrrogables.
        </p>
      </div>
    </div>
  );
}

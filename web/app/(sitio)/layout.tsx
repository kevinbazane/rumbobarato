import { BannerPlan } from '@/components/BannerPlan';
import { Encabezado } from '@/components/Encabezado';
import { PiePagina } from '@/components/PiePagina';
import { MODO_DEMO } from '@/lib/config';

export default function LayoutSitio({ children }: { children: React.ReactNode }) {
  return (
    <>
      {MODO_DEMO && (
        <div className="bg-tinta-900 py-1.5 text-center print:hidden text-xs font-medium text-tinta-200">
          Modo demo: estás viendo ofertas de ejemplo. Configura Supabase para ver las reales.
        </div>
      )}
      <BannerPlan />
      <Encabezado />
      <main>{children}</main>
      <PiePagina />
    </>
  );
}

import Link from 'next/link';
import { PLAN } from '@/lib/config';
import { fechaHora, precio } from '@/lib/formato';
import { obtenerSesion } from '@/lib/sesion';
import { IconoCampana } from './Iconos';

/**
 * Aviso superior sobre el plan:
 * - por vencer (3 días antes), en tolerancia (3 días después) y vencido.
 */
export async function BannerPlan() {
  const { usuario, plan } = await obtenerSesion();
  if (!usuario || !plan.premiumHasta) return null;

  let estilo = '';
  let texto = '';
  switch (plan.tipo) {
    case 'por_vencer':
      estilo = 'bg-tinta-900 text-white';
      texto = `Tu plan Premium vence el ${fechaHora(plan.premiumHasta)}. Renuévalo para seguir viendo las ofertas internacionales.`;
      break;
    case 'tolerancia':
      estilo = 'bg-amber-400 text-tinta-900';
      texto = `Tu plan Premium venció el ${fechaHora(plan.premiumHasta)}. Tienes hasta el ${fechaHora(plan.toleranciaHasta!)} para renovarlo sin perder el acceso.`;
      break;
    case 'vencido':
      estilo = 'bg-coral-600 text-white';
      texto = `Tu plan Premium venció. Renuévalo por S/ ${precio(PLAN.precio)} y vuelve a ver todas las ofertas nacionales e internacionales.`;
      break;
    default:
      return null;
  }

  return (
    <div role="status" className={estilo}>
      <div className="contenedor flex flex-col items-start gap-2 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 font-medium">
          <IconoCampana className="mt-0.5 h-4 w-4 shrink-0" />
          {texto}
        </p>
        <Link href="/premium" className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-tinta-900 hover:bg-arena-100">
          Renovar ahora
        </Link>
      </div>
    </div>
  );
}

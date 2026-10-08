import { PLAN } from './config.ts';

export type TipoEstadoPlan = 'free' | 'activo' | 'por_vencer' | 'tolerancia' | 'vencido';

export interface EstadoPlan {
  tipo: TipoEstadoPlan;
  /** true si puede ver ofertas internacionales (plan vigente o dentro de la tolerancia). */
  accesoPremium: boolean;
  premiumHasta: Date | null;
  /** Último momento con acceso: premiumHasta + días de tolerancia. */
  toleranciaHasta: Date | null;
  /** Días que faltan para premiumHasta (activo/por_vencer) o para toleranciaHasta (tolerancia). */
  diasRestantes: number;
}

const DIA = 24 * 60 * 60 * 1000;

export function estadoPlan(premiumHasta: Date | string | null | undefined, ahora: Date = new Date()): EstadoPlan {
  if (!premiumHasta) {
    return { tipo: 'free', accesoPremium: false, premiumHasta: null, toleranciaHasta: null, diasRestantes: 0 };
  }
  const hasta = new Date(premiumHasta);
  const tolerancia = new Date(hasta.getTime() + PLAN.diasTolerancia * DIA);
  const t = ahora.getTime();

  if (t < hasta.getTime()) {
    const dias = Math.ceil((hasta.getTime() - t) / DIA);
    return {
      tipo: dias <= PLAN.diasAvisoAntes ? 'por_vencer' : 'activo',
      accesoPremium: true,
      premiumHasta: hasta,
      toleranciaHasta: tolerancia,
      diasRestantes: dias,
    };
  }
  if (t < tolerancia.getTime()) {
    return {
      tipo: 'tolerancia',
      accesoPremium: true,
      premiumHasta: hasta,
      toleranciaHasta: tolerancia,
      diasRestantes: Math.ceil((tolerancia.getTime() - t) / DIA),
    };
  }
  return { tipo: 'vencido', accesoPremium: false, premiumHasta: hasta, toleranciaHasta: tolerancia, diasRestantes: 0 };
}

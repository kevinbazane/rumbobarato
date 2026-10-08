import { PLAN } from './config.ts';

/** Orden de Mercado Pago (API de Orders, /v1/orders). Solo los campos que usamos. */
export interface OrdenMP {
  id: string; // "ORD01..."
  status: string; // created | processing | action_required | processed | failed | canceled | expired | refunded | charged_back
  status_detail: string; // p. ej. accredited, in_process, rejected_by_issuer...
  total_amount: string;
  total_paid_amount?: string;
  currency?: string;
  external_reference?: string | null;
  payer?: { email?: string };
  checkout_url?: string;
  transactions?: {
    payments?: {
      id: string;
      status: string;
      status_detail: string;
      amount: string;
      paid_amount?: string;
      payment_method?: { id?: string; type?: string };
    }[];
  };
}

export const PREFIJO_REFERENCIA = 'premium-mensual:';

export type ResultadoValidacion =
  | { ok: true; usuarioId: string; monto: number; moneda: string; metodo: string }
  | { ok: false; motivo: string };

/**
 * Una orden activa el Premium solo si está pagada por completo (processed /
 * accredited), en soles, por al menos el precio del plan y con la referencia
 * de un usuario de RumboBarato.
 */
export function validarOrdenPagada(orden: OrdenMP, usuarioEsperado?: string): ResultadoValidacion {
  if (orden.status !== 'processed' || orden.status_detail !== 'accredited') {
    return { ok: false, motivo: `Orden en estado ${orden.status}/${orden.status_detail}` };
  }
  const moneda = orden.currency ?? PLAN.moneda;
  if (moneda !== PLAN.moneda) return { ok: false, motivo: `Moneda ${moneda}` };

  const monto = Number(orden.total_paid_amount ?? orden.total_amount);
  if (!Number.isFinite(monto) || monto + 0.001 < PLAN.precio) return { ok: false, motivo: `Monto ${monto}` };

  const ref = orden.external_reference ?? '';
  if (!ref.startsWith(PREFIJO_REFERENCIA)) return { ok: false, motivo: 'Referencia desconocida' };
  const usuarioId = ref.slice(PREFIJO_REFERENCIA.length);
  if (!/^[0-9a-f-]{36}$/i.test(usuarioId)) return { ok: false, motivo: 'Referencia inválida' };
  if (usuarioEsperado && usuarioEsperado !== usuarioId) return { ok: false, motivo: 'La orden es de otro usuario' };

  const metodo = orden.transactions?.payments?.[0]?.payment_method?.id ?? 'mercadopago';
  return { ok: true, usuarioId, monto, moneda, metodo };
}

/** Estado de la orden en palabras simples, para decidir qué mostrar. */
export function resumenOrden(orden: OrdenMP): 'pagada' | 'pendiente' | 'rechazada' {
  if (orden.status === 'processed' && orden.status_detail === 'accredited') return 'pagada';
  if (['created', 'processing', 'action_required'].includes(orden.status)) return 'pendiente';
  return 'rechazada';
}

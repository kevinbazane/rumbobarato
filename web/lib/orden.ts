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

/**
 * external_reference de la orden: "premium_" + id del usuario sin guiones.
 * La API de Orders rechaza caracteres como ":"; se usan solo letras, números y "_".
 */
export const PREFIJO_REFERENCIA = 'premium_';

export function referenciaDeUsuario(usuarioId: string): string {
  return PREFIJO_REFERENCIA + usuarioId.replace(/-/g, '').toLowerCase();
}

/** Recupera el id del usuario (uuid con guiones) desde la referencia, o null si no es válida. */
export function usuarioDeReferencia(ref: string | null | undefined): string | null {
  if (!ref?.startsWith(PREFIJO_REFERENCIA)) return null;
  const h = ref.slice(PREFIJO_REFERENCIA.length).toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(h)) return null;
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

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

  const usuarioId = usuarioDeReferencia(orden.external_reference);
  if (!usuarioId) return { ok: false, motivo: 'Referencia desconocida o inválida' };
  if (usuarioEsperado && usuarioEsperado.toLowerCase() !== usuarioId) return { ok: false, motivo: 'La orden es de otro usuario' };

  const metodo = orden.transactions?.payments?.[0]?.payment_method?.id ?? 'mercadopago';
  return { ok: true, usuarioId, monto, moneda, metodo };
}

/** Estado de la orden en palabras simples, para decidir qué mostrar. */
export function resumenOrden(orden: OrdenMP): 'pagada' | 'pendiente' | 'rechazada' {
  if (orden.status === 'processed' && orden.status_detail === 'accredited') return 'pagada';
  if (['created', 'processing', 'action_required'].includes(orden.status)) return 'pendiente';
  return 'rechazada';
}

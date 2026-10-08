import 'server-only';
import { randomUUID } from 'node:crypto';
import { PLAN, SITIO } from './config.ts';
import { PREFIJO_REFERENCIA, validarOrdenPagada, type OrdenMP } from './orden.ts';
import { supabaseAdmin } from './supabase/admin.ts';

/**
 * Integración con la API de Orders de Mercado Pago (/v1/orders), la más nueva, que
 * reemplaza a la API de Payments (marcada como "será descontinuada"):
 * - Yape: Checkout API, procesamiento automático (el resultado llega en la misma respuesta).
 * - Tarjeta: Checkout Pro, el usuario paga en la página de Mercado Pago (checkout_url).
 */
const API = 'https://api.mercadopago.com';

async function mp<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('Falta MP_ACCESS_TOKEN');
  const r = await fetch(`${API}${ruta}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
      ...(init.method === 'POST' ? { 'X-Idempotency-Key': randomUUID() } : {}),
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) {
    const c = cuerpo as { message?: string; errors?: { message?: string }[] };
    throw new Error(`Mercado Pago ${r.status}: ${c.errors?.[0]?.message ?? c.message ?? r.statusText}`);
  }
  return cuerpo as T;
}

const referencia = (usuarioId: string) => `${PREFIJO_REFERENCIA}${usuarioId}`;
const monto = PLAN.precio.toFixed(2); // la API de Orders recibe montos como texto: "9.90"
const descripcion = `${PLAN.nombre} – ${PLAN.dias} días`;

/** Checkout Pro: crea la orden y devuelve { id, checkoutUrl } para redirigir al usuario. */
export async function crearOrdenCheckoutPro(usuario: { id: string; email: string }) {
  const orden = await mp<OrdenMP>('/v1/orders', {
    method: 'POST',
    body: JSON.stringify({
      type: 'online',
      processing_mode: 'manual',
      total_amount: monto,
      external_reference: referencia(usuario.id),
      description: descripcion,
      payer: { email: usuario.email },
      items: [{ title: descripcion, unit_price: monto, quantity: 1, unit_measure: 'unit', total_amount: monto }],
      config: {
        online: {
          success_url: `${SITIO.url}/pago/exito`,
          pending_url: `${SITIO.url}/pago/pendiente`,
          failure_url: `${SITIO.url}/pago/error`,
          auto_return: 'approved',
        },
      },
    }),
  });
  if (!orden.checkout_url) throw new Error('Mercado Pago no devolvió checkout_url');
  return { id: orden.id, checkoutUrl: orden.checkout_url };
}

/** Yape: el navegador genera el token con el celular + código de aprobación. */
export function crearOrdenYape(usuario: { id: string; email: string }, token: string): Promise<OrdenMP> {
  return mp<OrdenMP>('/v1/orders', {
    method: 'POST',
    body: JSON.stringify({
      type: 'online',
      processing_mode: 'automatic',
      total_amount: monto,
      external_reference: referencia(usuario.id),
      description: descripcion,
      payer: { email: usuario.email },
      transactions: {
        payments: [{ amount: monto, payment_method: { id: 'yape', type: 'debit_card', token } }],
      },
    }),
  });
}

export function obtenerOrden(id: string): Promise<OrdenMP> {
  return mp<OrdenMP>(`/v1/orders/${encodeURIComponent(id)}`);
}

export type ResultadoActivacion =
  | { activado: true; premiumHasta: string }
  | { activado: false; motivo: string };

/**
 * Activa o extiende el Premium si la orden está pagada correctamente. Se puede
 * llamar varias veces con la misma orden (respuesta de Yape, webhook y página
 * de éxito): la base de datos la cuenta una sola vez.
 */
export async function activarSiCorresponde(orden: OrdenMP, usuarioEsperado?: string): Promise<ResultadoActivacion> {
  const v = validarOrdenPagada(orden, usuarioEsperado);
  if (!v.ok) return { activado: false, motivo: v.motivo };

  const pago = orden.transactions?.payments?.[0];
  const { data, error } = await supabaseAdmin().rpc('registrar_pago_aprobado', {
    p_id: orden.id,
    p_usuario: v.usuarioId,
    p_monto: v.monto,
    p_moneda: v.moneda,
    p_metodo: v.metodo,
    p_detalle: {
      pago_id: pago?.id ?? null,
      tipo: pago?.payment_method?.type ?? null,
      status_detail: orden.status_detail,
      payer_email: orden.payer?.email ?? null,
    },
    p_dias: PLAN.dias,
  });
  if (error) throw error;
  return { activado: true, premiumHasta: data as string };
}

/** Mensajes en español para los rechazos más comunes. */
export function explicarRechazo(detalle: string | undefined): string {
  const mensajes: Record<string, string> = {
    insufficient_amount: 'No hay saldo suficiente.',
    amount_limit_exceeded: 'Superaste el límite de Yape por operación o por día.',
    invalid_security_code: 'El código de aprobación no es correcto o ya venció.',
    bad_filled_security_code: 'El código de aprobación no es correcto o ya venció.',
    max_attempts_exceeded: 'Superaste el número de intentos. Prueba más tarde.',
    high_risk: 'El pago fue rechazado por seguridad. Prueba con otro medio.',
    rejected_by_issuer: 'Tu banco rechazó el pago. Prueba con otro medio.',
    call_for_authorize: 'Tu banco necesita que autorices el pago.',
  };
  const clave = Object.keys(mensajes).find((k) => detalle?.includes(k));
  return clave ? mensajes[clave] : 'El pago no se pudo completar. Prueba de nuevo o usa otro medio de pago.';
}

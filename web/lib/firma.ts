import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Valida la cabecera x-signature de un webhook de Mercado Pago.
 * Formato: "ts=1704908010,v1=<hmac sha256 hex>".
 * Plantilla firmada: "id:{data.id};request-id:{x-request-id};ts:{ts};"
 * (data.id en minúsculas si es alfanumérico). Ver documentación de Webhooks de MP.
 */
export function firmaMercadoPagoValida(opciones: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secreto: string;
}): boolean {
  const { xSignature, xRequestId, dataId, secreto } = opciones;
  if (!xSignature || !dataId) return false;

  const partes = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, ...v] = p.trim().split('=');
      return [k, v.join('=')];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  // La documentación pide el id en minúsculas si es alfanumérico; por si Mercado Pago
  // firma los ids de órdenes ("ORD01...") tal cual, se aceptan ambas variantes.
  const variantes = /^[a-z0-9]+$/i.test(dataId) ? [dataId.toLowerCase(), dataId] : [dataId];
  const recibido = Buffer.from(v1, 'hex');

  return variantes.some((id) => {
    let manifiesto = `id:${id};`;
    if (xRequestId) manifiesto += `request-id:${xRequestId};`;
    manifiesto += `ts:${ts};`;
    const esperado = Buffer.from(createHmac('sha256', secreto).update(manifiesto).digest('hex'), 'hex');
    return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
  });
}

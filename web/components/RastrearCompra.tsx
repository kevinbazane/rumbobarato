'use client';
import { useEffect } from 'react';
import { PLAN } from '@/lib/config';
import { rastrear } from '@/lib/pixel';

/**
 * Envía "Purchase" al píxel una sola vez por orden: el eventID evita que Meta lo
 * cuente dos veces y sessionStorage evita repetirlo si el usuario recarga la página.
 */
export function RastrearCompra({ ordenId, metodo }: { ordenId: string; metodo: string }) {
  useEffect(() => {
    const clave = `rb_compra_${ordenId}`;
    try {
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, '1');
    } catch {
      // Sin sessionStorage (modo privado estricto): igual se envía; el eventID evita duplicados en Meta.
    }
    rastrear('Purchase', { value: PLAN.precio, currency: PLAN.moneda, content_name: PLAN.nombre, content_type: 'product', metodo }, ordenId);
  }, [ordenId, metodo]);
  return null;
}

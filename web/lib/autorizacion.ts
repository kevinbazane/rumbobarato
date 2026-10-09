import 'server-only';
import { timingSafeEqual } from 'node:crypto';

/**
 * Verifica la clave que comparten Apps Script y la web (OFERTAS_API_SECRET),
 * enviada como "Authorization: Bearer <clave>".
 */
export function autorizadoAppsScript(cabecera: string | null): boolean {
  const secreto = process.env.OFERTAS_API_SECRET?.trim();
  if (!secreto || !cabecera?.startsWith('Bearer ')) return false;
  const a = Buffer.from(cabecera.slice(7));
  const b = Buffer.from(secreto);
  return a.length === b.length && timingSafeEqual(a, b);
}

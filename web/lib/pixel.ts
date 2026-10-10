/**
 * Píxel de Meta (Facebook/Instagram). El ID se configura en Vercel como
 * NEXT_PUBLIC_META_PIXEL_ID; sin él, nada de esto hace algo.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

type Fbq = (accion: 'track' | 'trackCustom' | 'init', evento: string, datos?: Record<string, unknown>, opciones?: { eventID?: string }) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Envía un evento al píxel si está cargado. Nunca rompe la página si falla. */
export function rastrear(evento: string, datos?: Record<string, unknown>, eventID?: string) {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', evento, datos, eventID ? { eventID } : undefined);
    }
  } catch {
    // El píxel es secundario: si falla (bloqueador, red), la web sigue igual.
  }
}

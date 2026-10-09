export const PLAN = {
  nombre: 'RumboBarato Premium',
  precio: 9.9,
  moneda: 'PEN',
  dias: 30,
  diasTolerancia: 3,
  diasAvisoAntes: 3,
} as const;

export const SITIO = {
  nombre: 'RumboBarato',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  descripcion:
    'Tarifas aéreas bajas detectadas en automático. Vuelos nacionales e internacionales desde Perú, ida y vuelta, con máximo 1 escala.',
};

/** Sin Supabase configurado, la web muestra ofertas de ejemplo (modo demo). */
export const MODO_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cuántos días se muestra una oferta en el inicio desde que se detectó. */
export const DIAS_VIGENCIA_OFERTA = 10;

/** Cookie con el id de la última orden de Checkout Pro, para verificarla al volver de Mercado Pago. */
export const COOKIE_ORDEN = 'rb_orden';

/** Canal de WhatsApp gratuito (ofertas nacionales). Se puede cambiar con NEXT_PUBLIC_WHATSAPP_CANAL en Vercel. */
export const WHATSAPP_CANAL =
  process.env.NEXT_PUBLIC_WHATSAPP_CANAL?.trim() || 'https://whatsapp.com/channel/0029VbEGgks65yDDNNABrv2C';

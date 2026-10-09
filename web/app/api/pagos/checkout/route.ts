import { NextResponse } from 'next/server';
import { COOKIE_ORDEN } from '@/lib/config';
import { crearOrdenCheckoutPro } from '@/lib/mercadopago';
import { obtenerSesion } from '@/lib/sesion';

/**
 * Crea la orden de Checkout Pro y devuelve la URL de pago de Mercado Pago.
 * Guarda el id de la orden en una cookie para verificarla al volver (/pago/exito).
 */
export async function POST() {
  const { usuario } = await obtenerSesion();
  if (!usuario) return NextResponse.json({ error: 'Inicia sesión para suscribirte.' }, { status: 401 });
  try {
    const orden = await crearOrdenCheckoutPro(usuario);
    const respuesta = NextResponse.json({ url: orden.checkoutUrl });
    respuesta.cookies.set(COOKIE_ORDEN, orden.id, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 2 });
    return respuesta;
  } catch (e) {
    console.error('checkout', e);
    // El detalle viene de Mercado Pago (no contiene claves) y ayuda a diagnosticar.
    const detalle = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `No pudimos iniciar el pago. Intenta de nuevo en un momento. Detalle: ${detalle}` }, { status: 502 });
  }
}

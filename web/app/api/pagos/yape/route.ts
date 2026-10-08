import { NextResponse, type NextRequest } from 'next/server';
import { activarSiCorresponde, crearOrdenYape, explicarRechazo } from '@/lib/mercadopago';
import { resumenOrden } from '@/lib/orden';
import { obtenerSesion } from '@/lib/sesion';

/** Cobra con Yape (API de Orders, procesamiento automático) usando el token del navegador. */
export async function POST(req: NextRequest) {
  const { usuario } = await obtenerSesion();
  if (!usuario) return NextResponse.json({ ok: false, mensaje: 'Inicia sesión para suscribirte.' }, { status: 401 });

  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token) return NextResponse.json({ ok: false, mensaje: 'Falta el token de Yape.' }, { status: 400 });

  try {
    const orden = await crearOrdenYape(usuario, token);
    const estado = resumenOrden(orden);
    if (estado === 'pagada') {
      const r = await activarSiCorresponde(orden, usuario.id);
      if (r.activado) return NextResponse.json({ ok: true, premiumHasta: r.premiumHasta });
      console.error('yape pagado pero no activado', orden.id, r.motivo);
      return NextResponse.json({ ok: false, mensaje: 'Recibimos tu pago, pero no pudimos activarlo. Escríbenos y lo resolvemos.' });
    }
    if (estado === 'pendiente') {
      return NextResponse.json({ ok: false, pendiente: true, mensaje: 'Tu pago está en revisión. Te activaremos apenas Mercado Pago lo apruebe.' });
    }
    const detalle = orden.transactions?.payments?.[0]?.status_detail ?? orden.status_detail;
    return NextResponse.json({ ok: false, mensaje: explicarRechazo(detalle) });
  } catch (e) {
    console.error('yape', e);
    return NextResponse.json({ ok: false, mensaje: 'No pudimos procesar el pago con Yape. Revisa el número y el código e intenta de nuevo.' }, { status: 502 });
  }
}

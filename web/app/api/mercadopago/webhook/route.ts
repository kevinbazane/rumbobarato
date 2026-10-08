import { NextResponse, type NextRequest } from 'next/server';
import { firmaMercadoPagoValida } from '@/lib/firma';
import { activarSiCorresponde, obtenerOrden } from '@/lib/mercadopago';

/**
 * Aviso de Mercado Pago cuando cambia una orden (evento "Order" en el panel de
 * Webhooks). Nunca se confía en el contenido del aviso: se consulta la orden a la
 * API de Mercado Pago y se valida ahí.
 * Responder 200 confirma la recepción; un 500 hace que Mercado Pago reintente.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const cuerpo = (await req.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };

  const tipo = cuerpo.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic');
  const dataId = url.searchParams.get('data.id') ?? (cuerpo.data?.id != null ? String(cuerpo.data.id) : null);
  if (tipo !== 'order' || !dataId) return NextResponse.json({ ignorado: true });

  const secreto = process.env.MP_WEBHOOK_SECRET?.trim();
  if (secreto) {
    const valida = firmaMercadoPagoValida({
      xSignature: req.headers.get('x-signature'),
      xRequestId: req.headers.get('x-request-id'),
      dataId,
      secreto,
    });
    if (!valida) return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
  }

  try {
    const orden = await obtenerOrden(dataId);
    const r = await activarSiCorresponde(orden);
    if (!r.activado) console.log('webhook: orden', dataId, 'no activa Premium:', r.motivo);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('webhook', dataId, e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

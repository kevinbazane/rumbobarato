import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FormularioWhatsapp } from '@/components/FormularioWhatsapp';
import { RastrearCompra } from '@/components/RastrearCompra';
import { COOKIE_ORDEN } from '@/lib/config';
import { fechaHora } from '@/lib/formato';
import { activarSiCorresponde, obtenerOrden } from '@/lib/mercadopago';
import { estadoPlan } from '@/lib/plan';
import { obtenerSesion } from '@/lib/sesion';

export const metadata: Metadata = { title: 'Estado del pago' };
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ estado: string }>;
  searchParams: Promise<{ order_id?: string }>;
};

/**
 * Vuelta desde Checkout Pro (success/pending/failure_url) o desde el pago con Yape.
 * En "exito" se consulta la orden a Mercado Pago y se activa al instante, por si
 * el webhook todavía no llegó. La orden debe ser del usuario conectado.
 */
export default async function EstadoPago({ params, searchParams }: Props) {
  const { estado } = await params;
  if (!['exito', 'pendiente', 'error'].includes(estado)) notFound();
  const { order_id } = await searchParams;
  const ordenId = order_id || (await cookies()).get(COOKIE_ORDEN)?.value;
  let { usuario, plan } = await obtenerSesion();
  // Orden confirmada como pagada por este usuario: se informa la compra al píxel.
  let compra: { ordenId: string; metodo: string } | null = null;

  if (estado === 'exito' && usuario && ordenId && /^ORD[0-9A-Z]+$/i.test(ordenId)) {
    try {
      const orden = await obtenerOrden(ordenId);
      const r = await activarSiCorresponde(orden, usuario.id);
      if (r.activado) {
        plan = estadoPlan(r.premiumHasta);
        compra = { ordenId: orden.id, metodo: orden.transactions?.payments?.[0]?.payment_method?.id ?? 'mercadopago' };
      }
    } catch (e) {
      console.error('verificar orden', e);
    }
  }

  const contenido = {
    exito: plan.accesoPremium
      ? { emoji: '🎉', titulo: '¡Ya eres Premium!', texto: `Tu plan está activo hasta el ${fechaHora(plan.premiumHasta!)}. Ya puedes ver todas las ofertas internacionales.` }
      : { emoji: '⏳', titulo: 'Estamos confirmando tu pago', texto: 'Mercado Pago nos avisará en unos minutos y tu plan se activará automáticamente. Puedes recargar esta página.' },
    pendiente: { emoji: '⏳', titulo: 'Tu pago está pendiente', texto: 'Apenas Mercado Pago lo apruebe, activaremos tu plan automáticamente. No necesitas hacer nada más.' },
    error: { emoji: '😕', titulo: 'El pago no se completó', texto: 'No se realizó ningún cobro. Puedes intentarlo de nuevo con Yape o con otra tarjeta.' },
  }[estado as 'exito' | 'pendiente' | 'error'];

  return (
    <div className="contenedor grid min-h-[60vh] place-items-center py-12">
      {compra && <RastrearCompra ordenId={compra.ordenId} metodo={compra.metodo} />}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-elevada ring-1 ring-tinta-100/60">
        <p className="text-5xl">{contenido.emoji}</p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{contenido.titulo}</h1>
        <p className="mt-2 text-tinta-600">{contenido.texto}</p>
        {estado === 'exito' && usuario && plan.accesoPremium && !usuario.aceptaPromos && (
          <div className="mt-6 text-left">
            <p className="mb-2 text-sm font-bold">¿Quieres que te avisemos de promociones por WhatsApp?</p>
            <FormularioWhatsapp whatsappInicial={usuario.whatsapp} aceptaInicial={usuario.aceptaPromos} compacto />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-2">
          {estado === 'error' ? (
            <Link href="/premium" className="boton-primario">Intentar de nuevo</Link>
          ) : (
            <Link href="/#internacionales" className="boton-primario">Ver ofertas internacionales</Link>
          )}
          <Link href="/cuenta" className="boton-claro">Ir a mi cuenta</Link>
        </div>
      </div>
    </div>
  );
}

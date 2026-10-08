'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MercadoPago?: new (clavePublica: string, opciones?: { locale?: string }) => {
      yape: (datos: { otp: string; phoneNumber: string }) => { create: () => Promise<{ id: string }> };
    };
  }
}

const SDK = 'https://sdk.mercadopago.com/js/v2';

function cargarSdk(): Promise<void> {
  if (window.MercadoPago) return Promise.resolve();
  return new Promise((resolver, rechazar) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SDK}"]`);
    const s = existente ?? document.createElement('script');
    s.addEventListener('load', () => resolver());
    s.addEventListener('error', () => rechazar(new Error('No se pudo cargar Mercado Pago')));
    if (!existente) {
      s.src = SDK;
      document.head.appendChild(s);
    }
  });
}

/**
 * Pago con Yape vía Mercado Pago: el usuario pone su celular y el código de
 * aprobación que genera la app de Yape (Menú → Código de aprobación).
 */
export function FormularioYape({ monto }: { monto: string }) {
  const router = useRouter();
  const clavePublica = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
  const [celular, setCelular] = useState('');
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'error' | 'pendiente'>('listo');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (clavePublica) cargarSdk().catch(() => {});
  }, [clavePublica]);

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    if (!clavePublica) return;
    setEstado('enviando');
    setMensaje('');
    try {
      await cargarSdk();
      const mp = new window.MercadoPago!(clavePublica, { locale: 'es-PE' });
      const token = await mp.yape({ otp: codigo, phoneNumber: celular }).create();
      const r = await fetch('/api/pagos/yape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.id }),
      });
      const datos = (await r.json()) as { ok: boolean; pendiente?: boolean; mensaje?: string };
      if (datos.ok) {
        router.push('/pago/exito?medio=yape');
        router.refresh();
        return;
      }
      setEstado(datos.pendiente ? 'pendiente' : 'error');
      setMensaje(datos.mensaje ?? 'No se pudo completar el pago.');
    } catch {
      setEstado('error');
      setMensaje('Revisa tu número y el código de aprobación (vence en pocos minutos) e inténtalo de nuevo.');
    }
  }

  if (!clavePublica) {
    return <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Falta configurar la clave pública de Mercado Pago (NEXT_PUBLIC_MP_PUBLIC_KEY).</p>;
  }

  const valido = /^9\d{8}$/.test(celular) && /^\d{6}$/.test(codigo);

  return (
    <form onSubmit={pagar} className="space-y-4">
      <div>
        <label htmlFor="celular" className="text-sm font-bold">Celular registrado en Yape</label>
        <input
          id="celular" inputMode="numeric" autoComplete="tel-national" placeholder="987 654 321" maxLength={11}
          className="campo mt-1.5" value={celular}
          onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))}
        />
      </div>
      <div>
        <label htmlFor="codigo" className="text-sm font-bold">Código de aprobación</label>
        <input
          id="codigo" inputMode="numeric" autoComplete="one-time-code" placeholder="6 dígitos" maxLength={6}
          className="campo mt-1.5 tracking-[0.4em]" value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <p className="mt-1.5 text-xs text-tinta-500">En tu app de Yape: <b>Menú → Código de aprobación</b>. Es válido por pocos minutos.</p>
      </div>
      {mensaje && (
        <p role="alert" className={`rounded-xl p-3 text-sm ${estado === 'pendiente' ? 'bg-amber-50 text-amber-800' : 'bg-coral-50 text-coral-800'}`}>
          {mensaje}
        </p>
      )}
      <button type="submit" disabled={!valido || estado === 'enviando'} className="boton w-full bg-[#742284] py-3.5 text-base text-white hover:bg-[#5e1b6b]">
        {estado === 'enviando' ? 'Procesando pago…' : `Pagar S/ ${monto} con Yape`}
      </button>
    </form>
  );
}

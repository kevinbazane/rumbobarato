'use client';
import { useState } from 'react';

/** Lleva al Checkout de Mercado Pago (tarjeta de crédito/débito y otros medios). */
export function BotonCheckout({ monto }: { monto: string }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function ir() {
    setCargando(true);
    setError('');
    try {
      const r = await fetch('/api/pagos/checkout', { method: 'POST' });
      const datos = (await r.json()) as { url?: string; error?: string };
      if (datos.url) {
        window.location.href = datos.url;
        return;
      }
      setError(datos.error ?? 'No pudimos iniciar el pago.');
    } catch {
      setError('No pudimos conectar con Mercado Pago. Revisa tu conexión.');
    }
    setCargando(false);
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={ir} disabled={cargando} className="boton w-full bg-[#009EE3] py-3.5 text-base text-white hover:bg-[#0089c4]">
        {cargando ? 'Abriendo Mercado Pago…' : `Pagar S/ ${monto} con tarjeta`}
      </button>
      <p className="text-center text-xs text-tinta-500">Crédito o débito Visa, Mastercard, American Express y Diners, a través de Mercado Pago.</p>
      {error && <p role="alert" className="rounded-xl bg-coral-50 p-3 text-sm text-coral-800">{error}</p>}
    </div>
  );
}

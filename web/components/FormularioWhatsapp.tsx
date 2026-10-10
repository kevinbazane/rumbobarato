'use client';
import { useState } from 'react';
import { IconoWhatsapp } from './Iconos';

/**
 * Campo opcional para dejar el WhatsApp y aceptar promociones.
 * La casilla nunca viene marcada: el permiso tiene que darlo la persona.
 */
export function FormularioWhatsapp({
  whatsappInicial, aceptaInicial, compacto = false,
}: { whatsappInicial: string | null; aceptaInicial: boolean; compacto?: boolean }) {
  const [numero, setNumero] = useState(whatsappInicial?.replace(/^\+51/, '') ?? '');
  const [acepta, setAcepta] = useState(aceptaInicial);
  const [estado, setEstado] = useState<'listo' | 'guardando' | 'guardado' | 'error'>('listo');
  const [mensaje, setMensaje] = useState('');

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('guardando');
    setMensaje('');
    try {
      const r = await fetch('/api/perfil/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: numero, aceptaPromos: acepta }),
      });
      const datos = (await r.json()) as { ok: boolean; mensaje?: string };
      setEstado(datos.ok ? 'guardado' : 'error');
      setMensaje(datos.ok ? 'Guardado.' : datos.mensaje ?? 'No se pudo guardar.');
    } catch {
      setEstado('error');
      setMensaje('No pudimos conectar. Intenta de nuevo.');
    }
  }

  return (
    <form onSubmit={guardar} className={`rounded-2xl border border-tinta-100 ${compacto ? 'p-4' : 'p-5'}`}>
      <p className="flex items-center gap-2 text-sm font-bold">
        <IconoWhatsapp className="h-4 w-4 text-[#128C4B]" /> Tu WhatsApp <span className="font-normal text-tinta-400">(opcional)</span>
      </p>
      <div className="mt-2 flex gap-2">
        <span className="campo w-auto shrink-0 bg-arena-100 px-3 text-tinta-500">+51</span>
        <input
          inputMode="tel" autoComplete="tel-national" placeholder="987 654 321" aria-label="Número de WhatsApp"
          className="campo" value={numero}
          onChange={(e) => { setNumero(e.target.value); setEstado('listo'); }}
        />
      </div>
      <label className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-tinta-600">
        <input
          type="checkbox" checked={acepta}
          onChange={(e) => { setAcepta(e.target.checked); setEstado('listo'); }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-coral-500"
        />
        <span>
          Acepto recibir por WhatsApp promociones y ofertas de RumboBarato. Puedo retirar mi permiso cuando quiera desde Mi cuenta. Ver{' '}
          <a href="/privacidad" className="underline">Política de privacidad</a>.
        </span>
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={estado === 'guardando'} className="boton-oscuro px-4 py-2 text-xs">
          {estado === 'guardando' ? 'Guardando…' : 'Guardar'}
        </button>
        {mensaje && (
          <span role="status" className={`text-xs ${estado === 'error' ? 'text-coral-700' : 'text-selva-700'}`}>{mensaje}</span>
        )}
      </div>
    </form>
  );
}

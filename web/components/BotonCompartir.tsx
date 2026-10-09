'use client';
import { useState } from 'react';
import { IconoWhatsapp } from './Iconos';

export function BotonCompartir({ texto, url }: { texto: string; url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // El navegador no permitió copiar; el usuario puede copiar la URL manualmente.
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        // api.whatsapp.com (no wa.me): wa.me redirige y en WhatsApp Web/Escritorio rompe algunos emojis.
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${texto}\n👉 ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="boton border border-[#25D366]/30 bg-[#25D366]/10 py-2.5 text-[#128C4B] hover:bg-[#25D366]/20"
      >
        <IconoWhatsapp className="h-4 w-4" /> Compartir
      </a>
      <button type="button" onClick={copiar} className="boton-claro py-2.5">
        {copiado ? '¡Copiado!' : 'Copiar link'}
      </button>
    </div>
  );
}

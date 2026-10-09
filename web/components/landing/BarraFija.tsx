'use client';
import { useEffect, useState } from 'react';
import { BotonCanal } from './BotonCanal';

/** Botón de WhatsApp fijo abajo en el celular, que aparece al bajar más allá de la portada. */
export function BarraFija() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revisar = () => setVisible(window.scrollY > 620);
    revisar();
    window.addEventListener('scroll', revisar, { passive: true });
    return () => window.removeEventListener('scroll', revisar);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-tinta-100 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition duration-300 sm:hidden ${visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
    >
      <BotonCanal texto="Unirme gratis por WhatsApp" className="w-full py-3.5" />
    </div>
  );
}

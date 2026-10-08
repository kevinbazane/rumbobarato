'use client';
import { useState } from 'react';
import { BotonCheckout } from './BotonCheckout';
import { FormularioYape } from './FormularioYape';

export function MediosDePago({ monto }: { monto: string }) {
  const [medio, setMedio] = useState<'yape' | 'tarjeta'>('yape');

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-arena-100 p-1">
        {(['yape', 'tarjeta'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={medio === m}
            onClick={() => setMedio(m)}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${medio === m ? 'bg-white text-tinta-900 shadow-sm' : 'text-tinta-500 hover:text-tinta-800'}`}
          >
            {m === 'yape' ? 'Yape' : 'Tarjeta'}
          </button>
        ))}
      </div>
      <div className="mt-5">{medio === 'yape' ? <FormularioYape monto={monto} /> : <BotonCheckout monto={monto} />}</div>
    </div>
  );
}

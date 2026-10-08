import Link from 'next/link';
import { Logo } from './Logo';

export function PiePagina() {
  return (
    <footer className="mt-24 bg-tinta-900 text-tinta-200">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo claro />
          <p className="mt-4 text-sm leading-relaxed text-tinta-300">
            Detectamos en automático las tarifas bajas de Google Flights para que viajes más pagando menos. Vuelos ida y vuelta desde Perú, con máximo una escala.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Explora</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/#nacionales" className="hover:text-white">Ofertas nacionales</Link></li>
            <li><Link href="/#internacionales" className="hover:text-white">Ofertas internacionales</Link></li>
            <li><Link href="/premium" className="hover:text-white">Plan Premium</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Tu cuenta</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/ingresar" className="hover:text-white">Ingresar</Link></li>
            <li><Link href="/cuenta" className="hover:text-white">Mi plan y pagos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="contenedor py-5 text-xs text-tinta-400">
          © {new Date().getFullYear()} RumboBarato. Los precios provienen de Google Flights al momento de la detección y pueden cambiar sin aviso. RumboBarato no vende pasajes: la compra se realiza en la aerolínea o agencia que elijas.
        </p>
      </div>
    </footer>
  );
}

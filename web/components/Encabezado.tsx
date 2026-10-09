import Link from 'next/link';
import { obtenerSesion } from '@/lib/sesion';
import { Logo } from './Logo';

export async function Encabezado() {
  const { usuario, plan } = await obtenerSesion();

  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-tinta-100/70 bg-arena-100/85 backdrop-blur-md">
      <div className="contenedor flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="RumboBarato, inicio">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
          <Link href="/#nacionales" className="hidden rounded-full px-3 py-2 text-tinta-700 hover:bg-white sm:inline-block">
            Ofertas
          </Link>
          <Link href="/#internacionales" className="hidden rounded-full px-3 py-2 text-tinta-700 hover:bg-white md:inline-block">
            Internacionales
          </Link>
          {usuario ? (
            <Link href="/cuenta" className="rounded-full px-3 py-2 text-tinta-700 hover:bg-white">
              Mi cuenta
            </Link>
          ) : (
            <Link href="/ingresar" className="rounded-full px-3 py-2 text-tinta-700 hover:bg-white">
              Ingresar
            </Link>
          )}
          {!plan.accesoPremium && (
            <Link href="/premium" className="boton-primario px-4 py-2">
              Premium
            </Link>
          )}
          {plan.accesoPremium && (
            <span className="etiqueta bg-coral-50 text-coral-700 ring-1 ring-coral-200">★ Premium</span>
          )}
        </nav>
      </div>
    </header>
  );
}

import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="contenedor grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="text-6xl">🧭</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Esta oferta ya despegó</h1>
        <p className="mt-2 text-tinta-600">No encontramos lo que buscas. Puede que la oferta haya expirado.</p>
        <Link href="/" className="boton-primario mt-6">Ver ofertas vigentes</Link>
      </div>
    </div>
  );
}

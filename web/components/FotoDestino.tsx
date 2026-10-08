import type { Imagen } from '@/lib/tipos';

/** Foto del destino; si no hay, un degradado de marca con el nombre. */
export function FotoDestino({
  imagen, nombre, className = '', prioridad = false,
}: { imagen?: Imagen; nombre: string; className?: string; prioridad?: boolean }) {
  if (!imagen) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-tinta-800 via-tinta-700 to-coral-600 ${className}`}>
        <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M0 200 90 110l60 60 70-90 90 100 90-60v120H0z" fill="#fff" />
          <circle cx="320" cy="60" r="28" fill="#FFC4B2" />
        </svg>
        <span className="absolute bottom-3 left-4 text-sm font-semibold text-white/80">{nombre}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imagen.url}
      alt={`Foto de ${nombre}`}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      className={`object-cover ${className}`}
    />
  );
}

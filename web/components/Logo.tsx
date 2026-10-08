const AVION =
  'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z';

/** Isotipo: avión despegando frente a un sol de atardecer. */
export function Isotipo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#FF5A36" />
      <circle cx="13" cy="28" r="10" fill="#FF9C80" />
      <path d={AVION} transform="translate(8 7) scale(1.05)" fill="#fff" stroke="#fff" strokeWidth=".8" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Isotipo />
      <span className={`text-xl font-extrabold tracking-tight ${claro ? 'text-white' : 'text-tinta-900'}`}>
        Rumbo<span className="text-coral-500">Barato</span>
      </span>
    </span>
  );
}

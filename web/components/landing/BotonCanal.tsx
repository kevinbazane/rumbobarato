import { WHATSAPP_CANAL } from '@/lib/config';
import { IconoWhatsapp } from '../Iconos';

/** Botón principal: abre el Canal de WhatsApp (en celular abre directo la app). */
export function BotonCanal({
  texto = 'Unirme gratis al canal',
  className = '',
  latido = false,
  compacto = false,
}: { texto?: string; className?: string; latido?: boolean; compacto?: boolean }) {
  return (
    <a
      href={WHATSAPP_CANAL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] font-extrabold ${compacto ? 'px-4 py-2 text-sm' : 'px-7 py-4 text-base'} text-[#06371C] shadow-[0_10px_28px_-10px_rgba(37,211,102,.9)] transition hover:bg-[#1fc15c] active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${latido ? 'animate-latido' : ''} ${className}`}
    >
      <IconoWhatsapp className={compacto ? 'h-4 w-4' : 'h-6 w-6'} />
      {texto}
    </a>
  );
}

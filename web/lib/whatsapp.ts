/**
 * Normaliza un número de WhatsApp al formato internacional "+51987654321".
 * Acepta celulares peruanos (9 dígitos que empiezan con 9, con o sin +51) y
 * números de otros países escritos con su código ("+56 9 1234 5678").
 * Devuelve null si no parece un número válido.
 */
export function normalizarWhatsapp(entrada: string): string | null {
  const limpio = entrada.trim().replace(/[\s().-]/g, '');
  if (!limpio) return null;
  if (/^9\d{8}$/.test(limpio)) return `+51${limpio}`;
  if (/^(\+?51)9\d{8}$/.test(limpio)) return `+${limpio.replace(/^\+/, '')}`;
  if (/^\+\d{8,15}$/.test(limpio) && !limpio.startsWith('+51')) return limpio;
  return null;
}

/** Link para abrir un chat de WhatsApp con ese número (wa.me usa el número sin "+"). */
export function linkChatWhatsapp(numero: string): string {
  return `https://wa.me/${numero.replace(/\D/g, '')}`;
}

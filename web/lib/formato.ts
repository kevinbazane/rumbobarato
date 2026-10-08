const ZONA = 'America/Lima';

/** "YYYY-MM-DD" → Date al mediodía UTC (evita que cambie el día por zona horaria). */
function fechaSimple(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

export function precio(valor: number): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

/** "lun 1 feb" */
export function fechaCorta(iso: string): string {
  const f = fechaSimple(iso);
  const dia = new Intl.DateTimeFormat('es-PE', { weekday: 'short', timeZone: 'UTC' }).format(f).replace('.', '').toLowerCase();
  const mes = new Intl.DateTimeFormat('es-PE', { month: 'short', timeZone: 'UTC' }).format(f).replace('.', '').toLowerCase();
  return `${dia} ${f.getUTCDate()} ${mes}`;
}

/** "lunes 1 de febrero de 2027" */
export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(fechaSimple(iso));
}

/** Fecha y hora de un timestamp, en hora de Lima: "12 de octubre de 2026". */
export function fechaHora(ts: string | Date, conHora = false): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA,
    ...(conHora ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(ts));
}

export function noches(ida: string, vuelta: string): number {
  return Math.round((fechaSimple(vuelta).getTime() - fechaSimple(ida).getTime()) / 86400000);
}

export function haceCuanto(ts: string, ahora: Date = new Date()): string {
  const min = Math.max(0, Math.round((ahora.getTime() - new Date(ts).getTime()) / 60000));
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

export function textoEscalas(n: number): string {
  return n === 0 ? 'Directo' : n === 1 ? '1 escala' : `${n} escalas`;
}

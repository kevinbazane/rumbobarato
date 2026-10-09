/** Hoja de reclamación: tipos, validación y formato del número. */

export const TIPOS_DOCUMENTO = ['DNI', 'Carné de extranjería', 'Pasaporte', 'RUC'] as const;

export interface DatosReclamo {
  nombre: string;
  tipo_documento: (typeof TIPOS_DOCUMENTO)[number];
  numero_documento: string;
  domicilio: string;
  telefono: string | null;
  email: string;
  menor_de_edad: boolean;
  apoderado: string | null;
  bien_tipo: 'producto' | 'servicio';
  monto: number | null;
  descripcion_bien: string;
  tipo: 'reclamo' | 'queja';
  detalle: string;
  pedido: string;
}

export type ResultadoReclamo = { ok: true; datos: DatosReclamo } | { ok: false; errores: Record<string, string> };

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export function validarReclamo(e: Record<string, unknown>): ResultadoReclamo {
  const errores: Record<string, string> = {};
  const req = (campo: string, min: number, max: number, nombre: string) => {
    const v = texto(e[campo]);
    if (v.length < min) errores[campo] = `Completa ${nombre}.`;
    else if (v.length > max) errores[campo] = `${nombre[0].toUpperCase()}${nombre.slice(1)}: máximo ${max} caracteres.`;
    return v;
  };

  const nombre = req('nombre', 3, 120, 'tu nombre completo');
  const tipoDoc = texto(e.tipo_documento) as DatosReclamo['tipo_documento'];
  if (!TIPOS_DOCUMENTO.includes(tipoDoc)) errores.tipo_documento = 'Elige el tipo de documento.';
  const numeroDoc = req('numero_documento', 6, 20, 'tu número de documento');
  if (tipoDoc === 'DNI' && numeroDoc && !/^\d{8}$/.test(numeroDoc)) errores.numero_documento = 'El DNI debe tener 8 dígitos.';
  if (tipoDoc === 'RUC' && numeroDoc && !/^\d{11}$/.test(numeroDoc)) errores.numero_documento = 'El RUC debe tener 11 dígitos.';
  const domicilio = req('domicilio', 5, 200, 'tu domicilio');
  const telefono = texto(e.telefono);
  if (telefono && !/^[+\d\s-]{6,20}$/.test(telefono)) errores.telefono = 'Revisa el número de teléfono.';
  const email = req('email', 5, 120, 'tu correo');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.email = 'Revisa el correo electrónico.';
  const menor = e.menor_de_edad === true;
  const apoderado = texto(e.apoderado);
  if (menor && apoderado.length < 3) errores.apoderado = 'Si eres menor de edad, indica el nombre de tu padre, madre o apoderado.';

  const bienTipo = e.bien_tipo === 'producto' ? 'producto' : e.bien_tipo === 'servicio' ? 'servicio' : null;
  if (!bienTipo) errores.bien_tipo = 'Indica si es un producto o un servicio.';
  let monto: number | null = null;
  const montoTexto = texto(e.monto);
  if (montoTexto) {
    monto = Number(montoTexto.replace(',', '.'));
    if (!Number.isFinite(monto) || monto < 0 || monto > 1_000_000) errores.monto = 'Revisa el monto.';
  }
  const descripcionBien = req('descripcion_bien', 3, 300, 'la descripción del producto o servicio');

  const tipo = e.tipo === 'reclamo' ? 'reclamo' : e.tipo === 'queja' ? 'queja' : null;
  if (!tipo) errores.tipo = 'Indica si es un reclamo o una queja.';
  const detalle = req('detalle', 10, 3000, 'el detalle');
  const pedido = req('pedido', 5, 1500, 'tu pedido');

  if (Object.keys(errores).length) return { ok: false, errores };
  return {
    ok: true,
    datos: {
      nombre, tipo_documento: tipoDoc, numero_documento: numeroDoc, domicilio,
      telefono: telefono || null, email: email.toLowerCase(), menor_de_edad: menor, apoderado: menor ? apoderado : null,
      bien_tipo: bienTipo!, monto, descripcion_bien: descripcionBien, tipo: tipo!, detalle, pedido,
    },
  };
}

/** Número visible de la hoja: "000001-2026". */
export function numeroHoja(numero: number, fecha: string | Date): string {
  const anio = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric' }).format(new Date(fecha));
  return `${String(numero).padStart(6, '0')}-${anio}`;
}

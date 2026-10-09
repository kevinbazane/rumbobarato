'use client';
import { useState } from 'react';
import { TIPOS_DOCUMENTO, type DatosReclamo } from '@/lib/reclamo';

interface Empresa { razonSocial: string; ruc: string; domicilio: string; correo: string; marca: string }
type Registrado = { numero: string; creado_en: string; datos: DatosReclamo };

const fechaLima = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(iso));

export function FormularioReclamo({ empresa }: { empresa: Empresa }) {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [menor, setMenor] = useState(false);
  const [registrado, setRegistrado] = useState<Registrado | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const cuerpo = Object.fromEntries(f.entries()) as Record<string, unknown>;
    cuerpo.menor_de_edad = menor;
    setEnviando(true);
    setMensaje('');
    setErrores({});
    try {
      const r = await fetch('/api/reclamos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      const datos = await r.json();
      if (datos.ok) {
        setRegistrado(datos);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (datos.errores) {
        setErrores(datos.errores);
        setMensaje('Revisa los campos marcados en rojo.');
      } else {
        setMensaje(datos.mensaje ?? 'No pudimos registrar tu hoja.');
      }
    } catch {
      setMensaje('No pudimos conectar. Revisa tu internet e intenta de nuevo.');
    }
    setEnviando(false);
  }

  if (registrado) return <Hoja empresa={empresa} r={registrado} />;

  const err = (c: string) => errores[c] && <p className="mt-1 text-xs font-medium text-coral-700">{errores[c]}</p>;
  const etiqueta = 'text-sm font-bold text-tinta-800';

  return (
    <form onSubmit={enviar} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="text-lg font-extrabold">1. Identificación del consumidor reclamante</legend>
        <div>
          <label className={etiqueta} htmlFor="nombre">Nombres y apellidos *</label>
          <input id="nombre" name="nombre" className="campo mt-1.5" autoComplete="name" />{err('nombre')}
        </div>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <div>
            <label className={etiqueta} htmlFor="tipo_documento">Documento *</label>
            <select id="tipo_documento" name="tipo_documento" className="campo mt-1.5" defaultValue="DNI">
              {TIPOS_DOCUMENTO.map((t) => <option key={t}>{t}</option>)}
            </select>{err('tipo_documento')}
          </div>
          <div>
            <label className={etiqueta} htmlFor="numero_documento">Número de documento *</label>
            <input id="numero_documento" name="numero_documento" className="campo mt-1.5" inputMode="numeric" />{err('numero_documento')}
          </div>
        </div>
        <div>
          <label className={etiqueta} htmlFor="domicilio">Domicilio *</label>
          <input id="domicilio" name="domicilio" className="campo mt-1.5" autoComplete="street-address" />{err('domicilio')}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={etiqueta} htmlFor="email">Correo electrónico *</label>
            <input id="email" name="email" type="email" className="campo mt-1.5" autoComplete="email" />{err('email')}
          </div>
          <div>
            <label className={etiqueta} htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" className="campo mt-1.5" autoComplete="tel" />{err('telefono')}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={menor} onChange={(e) => setMenor(e.target.checked)} className="h-4 w-4 accent-coral-500" />
          Soy menor de edad
        </label>
        {menor && (
          <div>
            <label className={etiqueta} htmlFor="apoderado">Nombre del padre, madre o apoderado *</label>
            <input id="apoderado" name="apoderado" className="campo mt-1.5" />{err('apoderado')}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-extrabold">2. Identificación del bien contratado</legend>
        <div className="flex gap-6">
          {(['servicio', 'producto'] as const).map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm font-medium capitalize">
              <input type="radio" name="bien_tipo" value={b} defaultChecked={b === 'servicio'} className="h-4 w-4 accent-coral-500" /> {b}
            </label>
          ))}
        </div>{err('bien_tipo')}
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <div>
            <label className={etiqueta} htmlFor="monto">Monto reclamado (S/)</label>
            <input id="monto" name="monto" inputMode="decimal" placeholder="9.90" className="campo mt-1.5" />{err('monto')}
          </div>
          <div>
            <label className={etiqueta} htmlFor="descripcion_bien">Descripción *</label>
            <input id="descripcion_bien" name="descripcion_bien" placeholder="Ej.: Plan Premium mensual" className="campo mt-1.5" />{err('descripcion_bien')}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-extrabold">3. Detalle de la reclamación y pedido del consumidor</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ['reclamo', 'Reclamo', 'Disconformidad relacionada a los productos o servicios.'],
            ['queja', 'Queja', 'Disconformidad no relacionada a los productos o servicios, o malestar o descontento respecto a la atención al público.'],
          ] as const).map(([v, t, d]) => (
            <label key={v} className="flex cursor-pointer gap-3 rounded-2xl border border-tinta-100 p-4 has-[:checked]:border-coral-400 has-[:checked]:bg-coral-50">
              <input type="radio" name="tipo" value={v} defaultChecked={v === 'reclamo'} className="mt-1 h-4 w-4 accent-coral-500" />
              <span><span className="font-bold">{t}</span><span className="mt-0.5 block text-xs text-tinta-600">{d}</span></span>
            </label>
          ))}
        </div>{err('tipo')}
        <div>
          <label className={etiqueta} htmlFor="detalle">Detalle *</label>
          <textarea id="detalle" name="detalle" rows={5} className="campo mt-1.5" />{err('detalle')}
        </div>
        <div>
          <label className={etiqueta} htmlFor="pedido">Pedido *</label>
          <textarea id="pedido" name="pedido" rows={3} placeholder="¿Qué solución esperas?" className="campo mt-1.5" />{err('pedido')}
        </div>
      </fieldset>

      {mensaje && <p role="alert" className="rounded-xl bg-coral-50 p-3 text-sm text-coral-800">{mensaje}</p>}
      <button type="submit" disabled={enviando} className="boton-primario w-full py-4 text-base sm:w-auto">
        {enviando ? 'Registrando…' : 'Enviar hoja de reclamación'}
      </button>
      {/* Campo trampa para robots (invisible para las personas) */}
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <p className="text-xs text-tinta-500">
        Al enviar, tus datos se usarán solo para atender esta reclamación, según nuestra{' '}
        <a href="/privacidad" className="underline">Política de privacidad</a>.
      </p>
    </form>
  );
}

function Hoja({ empresa, r }: { empresa: Empresa; r: Registrado }) {
  const d = r.datos;
  const filas: [string, string][] = [
    ['Nombres y apellidos', d.nombre],
    [d.tipo_documento, d.numero_documento],
    ['Domicilio', d.domicilio],
    ['Correo', d.email],
    ['Teléfono', d.telefono ?? '—'],
    ...(d.menor_de_edad ? ([['Padre, madre o apoderado', d.apoderado ?? '—']] as [string, string][]) : []),
  ];
  const texto = [
    `HOJA DE RECLAMACIÓN N.° ${r.numero}`,
    `Fecha: ${fechaLima(r.creado_en)}`,
    `Proveedor: ${empresa.razonSocial} (${empresa.marca}) · RUC ${empresa.ruc} · ${empresa.domicilio}`,
    '', '1. Consumidor', ...filas.map(([k, v]) => `${k}: ${v}`),
    '', '2. Bien contratado', `Tipo: ${d.bien_tipo}`, `Monto reclamado: ${d.monto != null ? `S/ ${d.monto.toFixed(2)}` : '—'}`, `Descripción: ${d.descripcion_bien}`,
    '', `3. ${d.tipo === 'reclamo' ? 'Reclamo' : 'Queja'}`, `Detalle: ${d.detalle}`, `Pedido: ${d.pedido}`,
  ].join('\n');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-selva-50 p-5 print:hidden">
        <p className="font-extrabold text-selva-700">✅ Registramos tu hoja de reclamación N.° {r.numero}</p>
        <p className="mt-1 text-sm text-tinta-700">
          Te responderemos al correo <b>{d.email}</b> en un plazo máximo de 15 días hábiles. Guarda esta constancia: puedes imprimirla o guardarla como PDF.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="boton-oscuro py-2.5">Imprimir o guardar PDF</button>
          <a
            href={`mailto:${d.email}?cc=${encodeURIComponent(empresa.correo)}&subject=${encodeURIComponent(`Hoja de reclamación N.° ${r.numero} - ${empresa.marca}`)}&body=${encodeURIComponent(texto)}`}
            className="boton-claro py-2.5"
          >
            Enviarme una copia por correo
          </a>
        </div>
      </div>

      <article className="rounded-3xl border border-tinta-200 bg-white p-6 text-sm sm:p-8 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-tinta-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tinta-400">Libro de Reclamaciones</p>
            <h2 className="text-xl font-extrabold">Hoja de reclamación N.° {r.numero}</h2>
            <p className="text-tinta-600">{fechaLima(r.creado_en)}</p>
          </div>
          <div className="text-right text-xs text-tinta-600">
            <p className="font-bold text-tinta-900">{empresa.razonSocial}</p>
            <p>RUC {empresa.ruc}</p>
            <p className="max-w-[240px]">{empresa.domicilio}</p>
          </div>
        </header>
        <Seccion titulo="1. Identificación del consumidor reclamante" filas={filas} />
        <Seccion
          titulo="2. Identificación del bien contratado"
          filas={[
            ['Tipo', d.bien_tipo === 'servicio' ? 'Servicio' : 'Producto'],
            ['Monto reclamado', d.monto != null ? `S/ ${d.monto.toFixed(2)}` : '—'],
            ['Descripción', d.descripcion_bien],
          ]}
        />
        <Seccion
          titulo="3. Detalle de la reclamación y pedido del consumidor"
          filas={[['Tipo', d.tipo === 'reclamo' ? 'Reclamo' : 'Queja'], ['Detalle', d.detalle], ['Pedido', d.pedido]]}
        />
        <Seccion titulo="4. Observaciones y acciones adoptadas por el proveedor" filas={[['Estado', 'Pendiente de respuesta']]} />
        <p className="mt-6 text-xs leading-relaxed text-tinta-500">
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
          El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles improrrogables.
        </p>
      </article>
    </div>
  );
}

function Seccion({ titulo, filas }: { titulo: string; filas: [string, string][] }) {
  return (
    <section className="mt-5">
      <h3 className="font-extrabold">{titulo}</h3>
      <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-[200px_1fr]">
        {filas.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-tinta-500">{k}</dt>
            <dd className="whitespace-pre-wrap font-medium text-tinta-900">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

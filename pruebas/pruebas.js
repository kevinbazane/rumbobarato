// Pruebas locales del parser: `node pruebas/pruebas.js`
// Carga Config.gs y Parser.gs tal como los usa Apps Script.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const raiz = path.join(__dirname, '..');
const ctx = vm.createContext({ console });
for (const f of ['Config.gs', 'Parser.gs']) vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, { filename: f });
const { analizarCorreo, evaluarOferta, generarMensaje, extraerEtiqueta, extraerPrecio, extraerFechas, extraerEscalas } = ctx;

const REF = new Date(2026, 9, 7);
const link = (q) => `https://www.google.com/url?q=${encodeURIComponent('https://www.google.com/travel/flights?tfs=' + q)}&amp;sa=D`;
const tarjeta = (q, { hora = '6:00 a.m. – 7:25 a.m.', aerolinea = 'LATAM', escalas = 'Sin escalas', ruta = 'LIM–CUZ', precio = 'S/&nbsp;289' } = {}) => `
  <a href="${link(q)}"><table><tr><td>${hora}</td></tr>
  <tr><td>${aerolinea} · ${escalas} · 1 h 25 min</td><td>${ruta}</td></tr>
  <tr><td><b>${precio}</b></td></tr></table></a>`;
const correo = ({ cabecera, tarjetas }) => `<html><head><style>.x{}</style></head><body>
  <table><tr><td>${cabecera}</td></tr></table>${tarjetas.join('')}
  <a href="${link('general')}">Ver todos los vuelos</a></body></html>`;

let ok = 0;
function prueba(nombre, fn) {
  try { fn(); ok++; console.log('✔', nombre); } catch (e) { console.log('✘', nombre, '\n ', e.message); process.exitCode = 1; }
}
const ofertas = (html) => analizarCorreo(html, '', REF).ofertas;

prueba('oferta válida: Lima–Cusco bajo, directo, ida y vuelta', () => {
  const html = correo({
    cabecera: 'Lima (LIM) a Cusco (CUZ)<br>jue, 15 oct – mar, 20 oct · Ida y vuelta · 1 adulto<br>Los precios son bajos actualmente',
    tarjetas: [
      tarjeta('caro', { precio: 'S/&nbsp;412', aerolinea: 'Sky Airline' }),
      tarjeta('barato', { precio: 'S/&nbsp;289', aerolinea: 'LATAM' }),
      tarjeta('escalas', { precio: 'S/&nbsp;350', aerolinea: 'JetSMART', escalas: '2 escalas' }),
    ],
  });
  const os = ofertas(html);
  assert.strictEqual(os.length, 1);
  const o = os[0];
  assert.strictEqual(o.origen.nombre, 'Lima');
  assert.strictEqual(o.destino.nombre, 'Cusco');
  assert.strictEqual(o.precio.valor, 289, 'debe elegir la más barata');
  assert.strictEqual(o.aerolinea, 'LATAM');
  assert.strictEqual(o.escalas, 0);
  assert.strictEqual(o.etiqueta, 'bajo');
  assert.strictEqual(o.numOpciones, 3);
  assert.ok(o.link.includes('tfs=barato'), o.link);
  assert.strictEqual(evaluarOferta(o).estado, 'APTA');
  const msg = generarMensaje(o, 'https://premium');
  assert.ok(msg.includes('Lima → Cusco'));
  assert.ok(msg.includes('Desde S/ 289 ida y vuelta'));
  assert.ok(msg.includes('Fechas: jue 15 oct – mar 20 oct'), msg);
  assert.ok(msg.includes('Aerolínea: LATAM'));
  assert.ok(msg.includes('Pasa a Premium 👉 https://premium'));
});

prueba('descarta precio típico', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Arequipa (AQP)<br>15 oct – 20 oct · Ida y vuelta<br>Los precios son típicos',
    tarjetas: [tarjeta('a', { ruta: 'LIM–AQP' })],
  }))[0];
  const ev = evaluarOferta(o);
  assert.strictEqual(ev.estado, 'DESCARTADA');
  assert.ok(/tipico/.test(ev.motivo));
});

prueba('descarta sin etiqueta', () => {
  const o = ofertas(correo({ cabecera: 'Lima (LIM) a Piura (PIU)<br>15 oct – 20 oct · Ida y vuelta', tarjetas: [tarjeta('a')] }))[0];
  assert.ok(/sin etiqueta/.test(evaluarOferta(o).motivo));
});

prueba('acepta internacional con nombre de ciudad y plantilla internacional', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Miami (MIA)<br>15 oct – 20 oct · Ida y vuelta<br>Precio bajo',
    tarjetas: [tarjeta('a', { ruta: 'LIM–MIA', aerolinea: 'American', precio: 'S/&nbsp;1,450' })],
  }))[0];
  assert.strictEqual(o.precio.valor, 1450);
  assert.strictEqual(o.destino.nombre, 'Miami');
  assert.strictEqual(ctx.esNacional(o), false);
  assert.strictEqual(evaluarOferta(o).estado, 'APTA');
  const msg = generarMensaje(o, 'https://premium');
  assert.ok(msg.startsWith('🌎 ¡Oferta internacional detectada!'), msg);
  assert.ok(!msg.includes('plan Free'), msg);
});

prueba('descarta si la opción más barata tiene 2 escalas, aunque haya otra directa', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Cusco (CUZ)<br>15 oct – 20 oct · Ida y vuelta<br>Los precios son bajos',
    tarjetas: [
      tarjeta('directo', { precio: 'S/&nbsp;289' }),
      tarjeta('escalas', { precio: 'S/&nbsp;199', aerolinea: 'JetSMART', escalas: '2 escalas' }),
    ],
  }))[0];
  assert.strictEqual(o.precio.valor, 199);
  const ev = evaluarOferta(o);
  assert.strictEqual(ev.estado, 'DESCARTADA');
  assert.ok(/2 escalas/.test(ev.motivo));
});

prueba('descarta 2 escalas cuando no hay otra opción', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Iquitos (IQT)<br>15 oct – 20 oct · Ida y vuelta<br>Los precios son bajos',
    tarjetas: [tarjeta('a', { escalas: '2 escalas', ruta: 'LIM–IQT' })],
  }))[0];
  assert.ok(/2 escalas/.test(evaluarOferta(o).motivo));
});

prueba('descarta solo ida', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Cusco (CUZ)<br>jue, 15 oct · Solo ida<br>Los precios son bajos',
    tarjetas: [tarjeta('a')],
  }))[0];
  assert.strictEqual(evaluarOferta(o).estado, 'DESCARTADA');
  assert.ok(/ida y vuelta/.test(evaluarOferta(o).motivo));
});

prueba('descarta precio en dólares', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Cusco (CUZ)<br>15 oct – 20 oct · Ida y vuelta<br>Los precios son bajos',
    tarjetas: [tarjeta('a', { precio: 'US$ 89' })],
  }))[0];
  assert.ok(/soles/.test(evaluarOferta(o).motivo));
});

prueba('error de extracción si falta la aerolínea', () => {
  const o = ofertas(correo({
    cabecera: 'Lima (LIM) a Cusco (CUZ)<br>15 oct – 20 oct · Ida y vuelta<br>Los precios son bajos',
    tarjetas: [tarjeta('a', { aerolinea: '' })],
  }))[0];
  const ev = evaluarOferta(o);
  assert.strictEqual(ev.estado, 'ERROR');
  assert.ok(/aerolínea/.test(ev.motivo));
});

prueba('varias rutas en un mismo correo se evalúan por separado', () => {
  const html = correo({
    cabecera: 'Ofertas desde Lima · Ida y vuelta',
    tarjetas: [
      `<a href="${link('cusco')}"><div>Lima → Cusco</div><div>12 nov – 16 nov</div><div>LATAM · Sin escalas</div><div>Precio bajo</div><div>S/ 259</div></a>`,
      `<a href="${link('tarapoto')}"><div>Lima → Tarapoto</div><div>3 dic – 8 dic</div><div>Sky · 1 escala</div><div>Precio típico</div><div>S/ 330</div></a>`,
    ],
  });
  const os = ofertas(html);
  assert.strictEqual(os.length, 2);
  assert.strictEqual(evaluarOferta(os[0]).estado, 'APTA');
  assert.strictEqual(os[1].destino.nombre, 'Tarapoto');
  assert.strictEqual(os[1].escalas, 1);
  assert.strictEqual(evaluarOferta(os[1]).estado, 'DESCARTADA');
});

prueba('respaldo sin links por tarjeta (texto plano)', () => {
  const texto = 'Lima a Chiclayo\n20 nov – 24 nov · Ida y vuelta\nLos precios son bajos\nLATAM · Sin escalas\nS/ 210\nhttps://www.google.com/travel/flights?tfs=x';
  const os = analizarCorreo('', texto, REF).ofertas;
  assert.strictEqual(os.length, 1);
  assert.strictEqual(os[0].destino.nombre, 'Chiclayo');
  assert.strictEqual(evaluarOferta(os[0]).estado, 'APTA');
});

prueba('etiquetas: no confunde "bajó" ni "precio más bajo"', () => {
  assert.strictEqual(extraerEtiqueta('El precio bajó S/ 40'), null);
  assert.strictEqual(extraerEtiqueta('Mostrando el precio más bajo'), null);
  assert.strictEqual(extraerEtiqueta('Los precios para tus fechas son bajos'), 'bajo');
  assert.strictEqual(extraerEtiqueta('Bajo'), 'bajo');
  assert.strictEqual(extraerEtiqueta('Los precios son altos'), 'alto');
  assert.strictEqual(extraerEtiqueta('S/ 80 más barato de lo habitual'), 'bajo');
  assert.strictEqual(extraerEtiqueta('Más barato de lo habitual'), 'bajo');
  assert.strictEqual(extraerEtiqueta('S/ 60 más económico que lo habitual'), 'bajo');
  assert.strictEqual(extraerEtiqueta('Precio bajo'), 'bajo');
  assert.strictEqual(extraerEtiqueta('Los precios son bajos\nPrecio típico'), 'ambigua');
});

prueba('precios: ignora montos de ahorro y usa el actual', () => {
  assert.strictEqual(extraerPrecio('Bajó S/ 45\nS/ 289').valor, 289);
  assert.strictEqual(extraerPrecio('S/ 340 S/ 289').valor, 289);
  assert.strictEqual(extraerPrecio('S/ 1.234').valor, 1234);
});

prueba('fechas y escalas', () => {
  const f = extraerFechas('S/ 289\nmar, 20 oct – dom, 25 oct', REF);
  assert.deepStrictEqual(Array.from(f, (d) => d.getDate()), [20, 25]);
  const enero = extraerFechas('10 ene – 15 ene', REF);
  assert.strictEqual(enero[0].getFullYear(), 2027);
  assert.strictEqual(extraerEscalas('Una escala'), 1);
  assert.strictEqual(extraerEscalas('Sin escalas'), 0);
});

// --- Correo real de Google Flights (8 oct 2026) ---
const muestra = fs.readFileSync(path.join(__dirname, 'muestras', 'alerta-google-flights-2026-10-08.html'), 'utf8');
const REF_MUESTRA = new Date(2026, 9, 8, 7, 18);

prueba('correo real: extrae las 3 opciones con precio, fechas, aerolínea y link', () => {
  const ops = analizarCorreo(muestra, '', REF_MUESTRA).opciones;
  const resumen = Array.from(ops, (o) => [o.precio.valor, ctx.fechaIso(o.ida), ctx.fechaIso(o.vuelta)].join(' '));
  assert.deepStrictEqual(resumen, ['291 2026-11-26 2026-12-04', '352 2026-11-15 2026-11-23', '352 2026-11-19 2026-11-26']);
  for (const o of ops) {
    assert.strictEqual(o.origen.nombre, 'Lima');
    assert.strictEqual(o.destino.nombre, 'Cusco');
    assert.strictEqual(o.escalas, 0);
    assert.strictEqual(o.aerolinea, 'JetSMART');
    assert.strictEqual(o.tipoViaje, 'ida_vuelta');
    assert.strictEqual(o.precio.moneda, 'PEN');
    assert.ok(o.link.startsWith('https://c.gle/'), o.link);
  }
  assert.strictEqual(new Set(Array.from(ops, (o) => o.link)).size, 3, 'cada opción con su propio link');
});

prueba('correo real: una sola oferta por ruta (la más barata), descartada por precio "normal"', () => {
  const os = analizarCorreo(muestra, '', REF_MUESTRA).ofertas;
  assert.strictEqual(os.length, 1);
  assert.strictEqual(os[0].precio.valor, 291);
  assert.strictEqual(os[0].numOpciones, 3);
  assert.strictEqual(os[0].etiqueta, 'tipico');
  assert.strictEqual(evaluarOferta(os[0]).estado, 'DESCARTADA');
});

prueba('correo real con precios "bajos" genera mensaje', () => {
  const bajo = muestra.replace('>normales<', '>bajos<').replace('es un precio estándar', 'es un precio bajo');
  const o = analizarCorreo(bajo, '', REF_MUESTRA).ofertas[0];
  assert.strictEqual(o.etiqueta, 'bajo');
  assert.strictEqual(evaluarOferta(o).estado, 'APTA');
  const msg = generarMensaje(o, 'https://premium');
  assert.ok(msg.includes('Lima → Cusco\nDesde S/ 291 ida y vuelta'), msg);
  assert.ok(msg.includes('Fechas: jue 26 nov – vie 4 dic'), msg);
  assert.ok(msg.includes('Aerolínea: JetSMART'), msg);
});

// --- Correo real con precio bajo: Lima → Cajamarca desde PEN 257 (8 oct 2026) ---
const cajamarca = fs.readFileSync(path.join(__dirname, 'muestras', 'alerta-lima-cajamarca-2026-10-08.html'), 'utf8');

prueba('correo real Cajamarca: 3 fechas al mismo precio → 1 solo mensaje con la fecha más cercana', () => {
  const r = analizarCorreo(cajamarca, '', new Date(2026, 9, 8, 7, 11));
  assert.strictEqual(r.opciones.length, 3);
  assert.strictEqual(r.ofertas.length, 1);
  const o = r.ofertas[0];
  assert.strictEqual(o.precio.valor, 257);
  assert.strictEqual(ctx.fechaIso(o.ida), '2027-02-01');
  assert.strictEqual(ctx.fechaIso(o.vuelta), '2027-02-07');
  assert.strictEqual(o.etiqueta, 'bajo');
  assert.strictEqual(o.destino.nombre, 'Cajamarca');
  assert.strictEqual(o.escalas, 0);
  assert.strictEqual(o.aerolinea, 'JetSMART');
  assert.strictEqual(o.clave, 'LIM|CJA|2027-02-01|2027-02-07');
  assert.strictEqual(evaluarOferta(o).estado, 'APTA');
  const msg = generarMensaje(o, 'https://premium');
  assert.ok(msg.includes('Lima → Cajamarca\nDesde S/ 257 ida y vuelta'), msg);
  assert.ok(msg.includes('Fechas: lun 1 feb – dom 7 feb'), msg);
});

// --- Internacional simulado sobre la plantilla real (Lima → Tokio) ---
const tokio = muestra
  .replace('de Lima a Cusco', 'de Lima a Tokio')
  .replace('>normales<', '>bajos<').replace('es un precio estándar', 'es un precio bajo')
  .replace(/Desde PEN\s291/, 'Desde PEN 6,498').replace(/Desde PEN\s352/g, 'Desde PEN 4,357')
  .replace(/LIM–CUZ/, 'LIM–HND').replace(/LIM–CUZ/g, 'LIM–NRT')
  .replace(/JetSMART · /g, 'Japan Airlines, LATAM · ').replace(/Directo · /g, '1 parada · ');

prueba('internacional: 1 sola fila por ruta aunque cambie el aeropuerto (NRT/HND)', () => {
  const r = analizarCorreo(tokio, '', REF_MUESTRA);
  assert.strictEqual(r.ofertas.length, 1);
  const o = r.ofertas[0];
  assert.strictEqual(o.precio.valor, 4357);
  assert.strictEqual(o.destino.nombre, 'Tokio');
  assert.strictEqual(o.escalas, 1, '"1 parada" = 1 escala');
  assert.strictEqual(o.aerolinea, 'Japan Airlines');
  assert.strictEqual(evaluarOferta(o).estado, 'APTA');
});

prueba('paradas y aerolínea fuera de la lista', () => {
  assert.strictEqual(extraerEscalas('Sin paradas'), 0);
  assert.strictEqual(extraerEscalas('2 paradas'), 2);
  assert.strictEqual(ctx.extraerAerolinea('Aerolíneas Ficticias, Iberia · 1 parada · LIM–MAD · 13 h'), 'Iberia');
  assert.strictEqual(ctx.extraerAerolinea('Fly Ejemplo · 1 parada · LIM–XYZ · 13 h'), 'Fly Ejemplo');
});

prueba('código desconocido toma el nombre de la ciudad de la cabecera', () => {
  const html = muestra.replace('de Lima a Cusco', 'de Lima a Santiago de Chile').replace(/LIM–CUZ/g, 'LIM–XYZ');
  const o = analizarCorreo(html, '', REF_MUESTRA).ofertas[0];
  assert.strictEqual(o.destino.nombre, 'Santiago de Chile');
  assert.strictEqual(ctx.buscarAeropuertoPorCodigo('SCL').nombre, 'Santiago de Chile');
});

console.log(`\n${ok} pruebas OK`);

/**
 * RumboBarato — Orquestación: Gmail -> filtros -> registro en Sheets -> correo con el mensaje listo.
 *
 * Funciones para ejecutar a mano desde el editor de Apps Script:
 *   instalar()             Crea el Google Sheet de registro y el disparador automático.
 *   revisarAlertas()       Lo que corre el disparador. Puedes ejecutarlo a mano para probar.
 *   probarUltimaAlerta()   Analiza la alerta más reciente SIN registrar ni enviar nada (ver Registro de ejecución).
 *   guardarMuestraEnDrive() Guarda el HTML de la última alerta en tu Drive (útil para ajustar el parser).
 *   probarConexionWeb()    Comprueba que Apps Script puede publicar ofertas en tu web.
 *   publicarOfertasPendientesEnWeb() Sube a la web las ofertas recientes que no llegaron a publicarse.
 *   revisarReclamos()      Te envía un correo por cada reclamo nuevo del Libro de Reclamaciones (corre solo cada 5 min).
 *   sincronizarClientes()  Actualiza ya las pestañas "Enviar ofertas Premium" y "Clientes Premium (todos)" del Sheet.
 *   desinstalar()          Elimina el disparador automático.
 */

var HOJA_OFERTAS = 'Ofertas';
var HOJA_CORREOS = 'Correos';
var COLUMNAS_OFERTAS = [
  'Registrado el', 'Fecha del correo', 'Asunto', 'ID correo', 'Origen', 'Destino',
  'Cód. origen', 'Cód. destino', 'Ida', 'Vuelta', 'Precio', 'Moneda', 'Escalas', 'Aerolínea',
  'Etiqueta', 'Tipo de viaje', 'Opciones en el correo', 'Link', 'Estado', 'Motivo', 'Clave', 'Mensaje',
  'Alcance', 'Link corto',
];
var COLUMNAS_CORREOS = ['ID correo', 'Fecha del correo', 'Asunto', 'Procesado el', 'Ofertas encontradas', 'Resultado'];

var ESTADO_GENERADO = 'MENSAJE GENERADO';

// ---------------------------------------------------------------------------
// Instalación
// ---------------------------------------------------------------------------

function instalar() {
  var ss = obtenerSpreadsheet();
  desinstalar();
  ScriptApp.newTrigger('revisarAlertas').timeBased().everyMinutes(CONFIG.MINUTOS_ENTRE_REVISIONES).create();
  Logger.log('Listo. Registro: ' + ss.getUrl());
  Logger.log('Se revisará Gmail cada ' + CONFIG.MINUTOS_ENTRE_REVISIONES + ' minutos.');
}

function desinstalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'revisarAlertas') ScriptApp.deleteTrigger(t);
  });
}

function obtenerSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.NOMBRE_SHEET);
    props.setProperty('SHEET_ID', ss.getId());
    ss.getSheets()[0].setName(HOJA_OFERTAS);
  }
  prepararHoja(ss, HOJA_OFERTAS, COLUMNAS_OFERTAS);
  prepararHoja(ss, HOJA_CORREOS, COLUMNAS_CORREOS);
  return ss;
}

function prepararHoja(ss, nombre, columnas) {
  var hoja = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  var actuales = hoja.getLastColumn() ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0] : [];
  if (actuales.join('|') !== columnas.join('|')) {
    // Escribe (o completa con columnas nuevas) la fila de títulos.
    hoja.getRange(1, 1, 1, columnas.length).setValues([columnas]).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

// ---------------------------------------------------------------------------
// Ejecución periódica
// ---------------------------------------------------------------------------

function revisarAlertas() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  try {
    var ss = obtenerSpreadsheet();
    var procesados = idsProcesados(ss);
    var hilos = GmailApp.search(CONFIG.GMAIL_QUERY, 0, CONFIG.MAX_CORREOS_POR_EJECUCION);
    var mensajes = [];
    hilos.forEach(function (h) {
      h.getMessages().forEach(function (m) {
        if (!procesados[m.getId()] && esAlertaGoogleFlights(m)) mensajes.push(m);
      });
    });
    mensajes.sort(function (a, b) { return a.getDate() - b.getDate(); });
    mensajes.forEach(function (m) { procesarCorreo(ss, m); });

    // Aprovecha la misma revisión para avisarte de reclamos nuevos del Libro de Reclamaciones.
    try {
      revisarReclamos();
    } catch (e) {
      Logger.log('No se pudieron revisar los reclamos: ' + e);
    }

    // Y para actualizar las pestañas de clientes Premium (como máximo cada 15 minutos).
    try {
      sincronizarClientes(false);
    } catch (e) {
      Logger.log('No se pudo actualizar la lista de clientes: ' + e);
    }
  } finally {
    lock.releaseLock();
  }
}

function esAlertaGoogleFlights(m) {
  return /noreply-travel@google\.com/i.test(m.getFrom());
}

function idsProcesados(ss) {
  var hoja = ss.getSheetByName(HOJA_CORREOS);
  var ids = {};
  if (hoja.getLastRow() < 2) return ids;
  hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues().forEach(function (r) { ids[r[0]] = true; });
  return ids;
}

function procesarCorreo(ss, m) {
  var resultado;
  var nOfertas = 0;
  try {
    var analisis = analizarCorreo(m.getBody(), m.getPlainBody(), m.getDate());
    nOfertas = analisis.ofertas.length;
    if (!nOfertas) {
      resultado = 'ERROR: no se encontró ninguna oferta con precio en el correo';
    } else {
      var conteo = {};
      analisis.ofertas.forEach(function (o) {
        var estado = procesarOferta(ss, m, o);
        conteo[estado] = (conteo[estado] || 0) + 1;
      });
      resultado = Object.keys(conteo).map(function (k) { return k + ': ' + conteo[k]; }).join(' | ');
    }
  } catch (e) {
    resultado = 'EXCEPCIÓN: ' + (e && e.stack ? e.stack : e);
  }
  ss.getSheetByName(HOJA_CORREOS).appendRow([m.getId(), m.getDate(), m.getSubject(), new Date(), nOfertas, resultado]);
}

function procesarOferta(ss, m, o) {
  var ev = evaluarOferta(o);
  var estado = ev.estado;
  var motivo = ev.motivo;
  var mensaje = '';
  var linkCorto = '';

  if (estado === 'APTA') {
    if (generadoRecientemente(ss, o.clave)) {
      estado = 'DUPLICADA';
      motivo = 'Ya se generó mensaje para esta ruta y fechas en las últimas ' + CONFIG.HORAS_DEDUPE + ' h';
    } else {
      o.link = resolverLink(o.link);
      var web = publicarEnWeb(datosParaWeb(o));
      linkCorto = web.url || acortarLink(o.link);
      if (web.error) motivo = 'No se publicó en la web: ' + web.error;
      mensaje = generarMensaje(Object.assign({}, o, { link: linkCorto || o.link }), CONFIG.LINK_PREMIUM);
      enviarMensajeListo(o, mensaje);
      estado = ESTADO_GENERADO;
    }
  }

  ss.getSheetByName(HOJA_OFERTAS).appendRow([
    new Date(), m.getDate(), m.getSubject(), m.getId(),
    o.origen ? o.origen.nombre : '', o.destino ? o.destino.nombre : '',
    o.origen ? o.origen.codigo || '' : '', o.destino ? o.destino.codigo || '' : '',
    o.ida ? fechaIso(o.ida) : '', o.vuelta ? fechaIso(o.vuelta) : '',
    o.precio ? o.precio.valor : '', o.precio ? o.precio.simbolo : '',
    o.escalas != null ? o.escalas : '', o.aerolinea || '',
    o.etiqueta || '', o.tipoViaje || '', o.numOpciones, o.link || '',
    estado, motivo, o.clave, mensaje,
    o.origen && o.destino ? (esNacional(o) ? 'Nacional' : 'Internacional') : '', linkCorto,
  ]);
  return estado;
}

function generadoRecientemente(ss, clave) {
  var hoja = ss.getSheetByName(HOJA_OFERTAS);
  if (hoja.getLastRow() < 2) return false;
  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, COLUMNAS_OFERTAS.length).getValues();
  var iFecha = COLUMNAS_OFERTAS.indexOf('Registrado el');
  var iEstado = COLUMNAS_OFERTAS.indexOf('Estado');
  var iClave = COLUMNAS_OFERTAS.indexOf('Clave');
  var limite = Date.now() - CONFIG.HORAS_DEDUPE * 3600 * 1000;
  return datos.some(function (r) {
    return r[iClave] === clave && r[iEstado] === ESTADO_GENERADO && new Date(r[iFecha]).getTime() >= limite;
  });
}

/**
 * Los correos traen links de redirección (c.gle/...) ligados a tu cuenta.
 * Sigue la redirección para obtener el link final de Google Flights; si no
 * se puede, deja el original (igual abre Google Flights).
 */
function resolverLink(url) {
  var actual = url;
  try {
    for (var i = 0; i < 5 && !esLinkVuelos(actual); i++) {
      var r = UrlFetchApp.fetch(actual, { followRedirects: false, muteHttpExceptions: true });
      var headers = r.getAllHeaders();
      var destino = headers.Location || headers.location;
      if (!destino) break;
      actual = limpiarLink(Array.isArray(destino) ? destino[0] : destino);
    }
  } catch (e) {
    return url;
  }
  return esLinkVuelos(actual) ? actual : url;
}

function urlWeb() {
  return String(CONFIG.WEB_URL || '').trim().replace(/\/$/, '');
}

function claveWeb() {
  return String(CONFIG.WEB_API_SECRET || '').trim();
}

function datosParaWeb(o) {
  return {
    clave: o.clave,
    alcance: esNacional(o) ? 'nacional' : 'internacional',
    origen_codigo: o.origen.codigo || null,
    origen_nombre: o.origen.nombre,
    destino_codigo: o.destino.codigo || null,
    destino_nombre: o.destino.nombre,
    precio: o.precio.valor,
    moneda: o.precio.moneda,
    fecha_ida: fechaIso(o.ida),
    fecha_vuelta: fechaIso(o.vuelta),
    escalas: o.escalas,
    aerolinea: o.aerolinea,
    link_google_flights: o.link,
  };
}

/** Explica en palabras simples qué significa la respuesta de la web. */
function explicarRespuestaWeb(codigo, texto) {
  if (codigo === 401) return 'clave incorrecta: WEB_API_SECRET (Config) no es igual a OFERTAS_API_SECRET (Vercel), o falta en Vercel';
  if (codigo === 404) return 'no se encontró la web: revisa WEB_URL en Config (debe ser como https://rumbobarato.vercel.app)';
  return 'la web respondió ' + codigo + ': ' + String(texto).slice(0, 200);
}

/**
 * Publica una oferta en la web. Devuelve { url, error }: url es el link de la
 * oferta (https://tuweb/o/codigo) o '' si no se pudo; error explica por qué.
 */
function publicarEnWeb(datos) {
  if (!urlWeb() || !claveWeb()) {
    return { url: '', error: 'WEB_URL o WEB_API_SECRET están vacíos en Config' };
  }
  try {
    var r = UrlFetchApp.fetch(urlWeb() + '/api/ofertas', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + claveWeb() },
      muteHttpExceptions: true,
      payload: JSON.stringify(datos),
    });
    var codigo = r.getResponseCode();
    if (codigo === 200 || codigo === 201) return { url: JSON.parse(r.getContentText()).url || '', error: '' };
    return { url: '', error: explicarRespuestaWeb(codigo, r.getContentText()) };
  } catch (e) {
    return { url: '', error: 'no se pudo conectar con la web: ' + e };
  }
}

/**
 * Ejecuta esta función para comprobar que Apps Script puede publicar en tu web.
 * No publica nada: envía datos vacíos a propósito y revisa la respuesta.
 */
function probarConexionWeb() {
  if (!urlWeb() || !claveWeb()) {
    Logger.log('❌ Falta configurar WEB_URL y/o WEB_API_SECRET en Config.');
    return;
  }
  var r = UrlFetchApp.fetch(urlWeb() + '/api/ofertas', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + claveWeb() },
    muteHttpExceptions: true,
    payload: '{}',
  });
  var codigo = r.getResponseCode();
  if (codigo === 400) {
    Logger.log('✅ Conexión correcta: la web aceptó la clave. Las próximas ofertas se publicarán solas.');
  } else {
    Logger.log('❌ ' + explicarRespuestaWeb(codigo, r.getContentText()));
  }
}

/**
 * Publica en la web las ofertas de los últimos días que generaron mensaje pero
 * no llegaron a la web (por ejemplo, si la web no estaba configurada). No envía
 * correos: en el registro de ejecución verás el link nuevo de cada una.
 */
function publicarOfertasPendientesEnWeb() {
  var ss = obtenerSpreadsheet();
  var hoja = ss.getSheetByName(HOJA_OFERTAS);
  if (hoja.getLastRow() < 2) return Logger.log('No hay ofertas registradas.');
  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, COLUMNAS_OFERTAS.length).getValues();
  var col = function (nombre) { return COLUMNAS_OFERTAS.indexOf(nombre); };
  var zona = ss.getSpreadsheetTimeZone();
  var iso = function (v) { return v instanceof Date ? Utilities.formatDate(v, zona, 'yyyy-MM-dd') : String(v); };
  var limite = Date.now() - 10 * 24 * 3600 * 1000;
  var publicadas = 0;

  datos.forEach(function (r, i) {
    if (r[col('Estado')] !== ESTADO_GENERADO) return;
    if (new Date(r[col('Registrado el')]).getTime() < limite) return;
    if (String(r[col('Link corto')]).indexOf(urlWeb() + '/o/') === 0) return; // ya está en la web

    var web = publicarEnWeb({
      clave: r[col('Clave')],
      alcance: r[col('Alcance')] === 'Nacional' ? 'nacional' : 'internacional',
      origen_codigo: r[col('Cód. origen')] || null,
      origen_nombre: r[col('Origen')],
      destino_codigo: r[col('Cód. destino')] || null,
      destino_nombre: r[col('Destino')],
      precio: Number(r[col('Precio')]),
      moneda: 'PEN',
      fecha_ida: iso(r[col('Ida')]),
      fecha_vuelta: iso(r[col('Vuelta')]),
      escalas: Number(r[col('Escalas')]),
      aerolinea: r[col('Aerolínea')],
      link_google_flights: r[col('Link')],
    });
    var fila = i + 2;
    if (web.url) {
      hoja.getRange(fila, col('Link corto') + 1).setValue(web.url);
      Logger.log('✅ ' + r[col('Origen')] + ' → ' + r[col('Destino')] + ': ' + web.url);
      publicadas++;
    } else {
      Logger.log('❌ ' + r[col('Origen')] + ' → ' + r[col('Destino')] + ': ' + web.error);
    }
  });
  Logger.log('Ofertas publicadas en la web: ' + publicadas);
}

/**
 * Te reenvía el mensaje "listo para copiar" de las ofertas de los últimos días que
 * ya están en la web pero cuyo mensaje salió con otro link (TinyURL o Google Flights).
 * El mensaje nuevo lleva en "Ver y comprar" el link de la oferta en tu web.
 */
function reenviarMensajesConLinkWeb() {
  var ss = obtenerSpreadsheet();
  var hoja = ss.getSheetByName(HOJA_OFERTAS);
  if (hoja.getLastRow() < 2) return Logger.log('No hay ofertas registradas.');
  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, COLUMNAS_OFERTAS.length).getValues();
  var col = function (nombre) { return COLUMNAS_OFERTAS.indexOf(nombre); };
  var limite = Date.now() - 10 * 24 * 3600 * 1000;
  var reenviados = 0;

  datos.forEach(function (r, i) {
    var linkWeb = String(r[col('Link corto')]);
    var mensaje = String(r[col('Mensaje')]);
    if (r[col('Estado')] !== ESTADO_GENERADO) return;
    if (new Date(r[col('Registrado el')]).getTime() < limite) return;
    var premiumDesactualizado = /Pasa a Premium 👉 /.test(mensaje) && mensaje.indexOf(CONFIG.LINK_PREMIUM) < 0;
    if (linkWeb.indexOf(urlWeb() + '/o/') !== 0) return;
    if (mensaje.indexOf(linkWeb) >= 0 && !premiumDesactualizado) return;

    // Actualiza los dos links del mensaje guardado: el de la oferta y el de Premium.
    var nuevo = mensaje
      .replace(/(Ver y comprar: )\S+/, '$1' + linkWeb)
      .replace(/(Pasa a Premium 👉 )\S+/, '$1' + CONFIG.LINK_PREMIUM);
    hoja.getRange(i + 2, col('Mensaje') + 1).setValue(nuevo);
    enviarMensajeListo({
      origen: { nombre: r[col('Origen')], nacional: r[col('Alcance')] === 'Nacional' },
      destino: { nombre: r[col('Destino')], nacional: r[col('Alcance')] === 'Nacional' },
      precio: { valor: Number(r[col('Precio')]) },
    }, nuevo);
    Logger.log('📧 Reenviado: ' + r[col('Origen')] + ' → ' + r[col('Destino')] + ' (' + linkWeb + ')');
    reenviados++;
  });
  Logger.log('Mensajes reenviados: ' + reenviados);
}

/** Link corto (TinyURL, o is.gd si TinyURL falla). Devuelve '' si no se pudo acortar. */
function acortarLink(url) {
  if (!CONFIG.ACORTAR_LINKS || !url) return '';
  var servicios = [
    'https://tinyurl.com/api-create.php?url=',
    'https://is.gd/create.php?format=simple&url=',
  ];
  for (var i = 0; i < servicios.length; i++) {
    try {
      var r = UrlFetchApp.fetch(servicios[i] + encodeURIComponent(url), { muteHttpExceptions: true });
      var corto = r.getContentText().trim();
      if (r.getResponseCode() === 200 && /^https:\/\/\S+$/.test(corto) && corto.length < 40) return corto;
    } catch (e) {
      // probar el siguiente servicio
    }
  }
  return '';
}

/**
 * Se envía con MailApp: GmailApp rompe los emojis de 4 bytes (🇵🇪, 👉, 🌎)
 * y los muestra como "����". En el HTML, además, van como entidades numéricas.
 */
function enviarMensajeListo(o, mensaje) {
  var destino = CONFIG.CORREO_DESTINO || Session.getEffectiveUser().getEmail();
  var alcance = esNacional(o) ? 'NACIONAL' : 'INTERNACIONAL';
  var canal = esNacional(o) ? 'Canal de WhatsApp Free' : 'canal de WhatsApp';
  var asunto = alcance + ' | ' + o.origen.nombre + ' → ' + o.destino.nombre +
    ' desde S/ ' + formatearPrecio(o.precio.valor) + ' – listo para copiar';
  var color = esNacional(o) ? '#188038' : '#1a73e8';
  var html =
    '<p style="font-family:Arial,sans-serif;margin:0 0 12px"><span style="background:' + color +
    ';color:#fff;font-weight:bold;padding:4px 10px;border-radius:4px">' + alcance + '</span></p>' +
    '<p style="font-family:Arial,sans-serif;color:#555">Copia el texto del recuadro y pégalo en el ' + canal + ':</p>' +
    '<div style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-wrap;border:1px solid #ddd;' +
    'border-radius:8px;padding:16px;background:#fafafa">' + escaparHtml(mensaje) + '</div>';
  MailApp.sendEmail({ to: destino, subject: asunto, body: mensaje, htmlBody: html, name: 'RumboBarato' });
}

/** Escapa HTML y convierte caracteres fuera del rango básico (emojis) en entidades. */
function escaparHtml(s) {
  return Array.from(s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    .map(function (c) { var cp = c.codePointAt(0); return cp > 0xffff ? '&#' + cp + ';' : c; })
    .join('');
}

// ---------------------------------------------------------------------------
// Diagnóstico
// ---------------------------------------------------------------------------

function ultimaAlerta() {
  var hilos = GmailApp.search(CONFIG.GMAIL_QUERY.replace(/newer_than:\S+/, ''), 0, 5);
  var mensajes = [];
  hilos.forEach(function (h) { mensajes = mensajes.concat(h.getMessages().filter(esAlertaGoogleFlights)); });
  mensajes.sort(function (a, b) { return b.getDate() - a.getDate(); });
  if (!mensajes.length) throw new Error('No encontré alertas de Google Flights en tu Gmail.');
  return mensajes[0];
}

function probarUltimaAlerta() {
  var m = ultimaAlerta();
  Logger.log('Correo: ' + m.getSubject() + ' (' + m.getDate() + ')');
  var analisis = analizarCorreo(m.getBody(), m.getPlainBody(), m.getDate());
  Logger.log('Opciones de vuelo encontradas: ' + analisis.opciones.length);
  analisis.ofertas.forEach(function (o, i) {
    var ev = evaluarOferta(o);
    Logger.log('--- Oferta ' + (i + 1) + ': ' + ev.estado + (ev.motivo ? ' — ' + ev.motivo : ''));
    Logger.log(JSON.stringify({
      origen: o.origen, destino: o.destino, precio: o.precio,
      ida: o.ida && fechaIso(o.ida), vuelta: o.vuelta && fechaIso(o.vuelta),
      escalas: o.escalas, aerolinea: o.aerolinea, etiqueta: o.etiqueta,
      tipoViaje: o.tipoViaje, link: o.link, opciones: o.numOpciones,
    }, null, 2));
    Logger.log('Alcance: ' + (esNacional(o) ? 'NACIONAL' : 'INTERNACIONAL'));
    if (ev.estado === 'APTA') {
      o.link = resolverLink(o.link);
      o.link = acortarLink(o.link) || o.link;
      Logger.log('\n' + generarMensaje(o, CONFIG.LINK_PREMIUM));
    }
  });
  if (analisis.ofertas.length) {
    Logger.log('Link resuelto de la oferta 1 (prueba): ' + resolverLink(analisis.ofertas[0].link));
  }
}

/** Resumen de las últimas 10 alertas (una línea por oferta), sin registrar ni enviar nada. */
function probarAlertasRecientes() {
  var hilos = GmailApp.search(CONFIG.GMAIL_QUERY.replace(/newer_than:\S+/, ''), 0, 10);
  var mensajes = [];
  hilos.forEach(function (h) { mensajes = mensajes.concat(h.getMessages().filter(esAlertaGoogleFlights)); });
  mensajes.sort(function (a, b) { return b.getDate() - a.getDate(); });
  mensajes.slice(0, 10).forEach(function (m) {
    Logger.log('📧 ' + m.getSubject());
    var analisis = analizarCorreo(m.getBody(), m.getPlainBody(), m.getDate());
    if (!analisis.ofertas.length) Logger.log('   ERROR: no se encontró ninguna oferta');
    analisis.ofertas.forEach(function (o) {
      var ev = evaluarOferta(o);
      Logger.log('   ' + ev.estado + (ev.motivo ? ' (' + ev.motivo + ')' : '') + ' | ' +
        (o.origen ? o.origen.nombre : '?') + ' → ' + (o.destino ? o.destino.nombre : '?') +
        ' | S/ ' + (o.precio ? o.precio.valor : '?') + ' | escalas: ' + o.escalas +
        ' | ' + o.aerolinea + ' | ' + o.etiqueta + ' | ' + (esNacional(o) ? 'Nacional' : 'Internacional') +
        ' | opciones: ' + o.numOpciones);
    });
  });
}

function guardarMuestraEnDrive() {
  var m = ultimaAlerta();
  var archivo = DriveApp.createFile('alerta-google-flights-' + fechaIso(m.getDate()) + '.html', m.getBody(), MimeType.HTML);
  Logger.log('Guardado en Drive: ' + archivo.getUrl());
}


// ---------------------------------------------------------------------------
// Libro de Reclamaciones: aviso por correo de cada reclamo nuevo
// ---------------------------------------------------------------------------

/**
 * Consulta en la web los reclamos que aún no se avisaron, te envía un correo por
 * cada uno y los marca como avisados. Corre sola dentro de revisarAlertas.
 */
function revisarReclamos() {
  if (!urlWeb() || !claveWeb()) return;
  var r = UrlFetchApp.fetch(urlWeb() + '/api/reclamos/pendientes', {
    headers: { Authorization: 'Bearer ' + claveWeb() },
    muteHttpExceptions: true,
  });
  if (r.getResponseCode() !== 200) {
    Logger.log('Reclamos: ' + explicarRespuestaWeb(r.getResponseCode(), r.getContentText()));
    return;
  }
  var reclamos = JSON.parse(r.getContentText()).reclamos || [];
  var avisados = [];
  reclamos.forEach(function (rec) {
    try {
      enviarAvisoReclamo(rec);
      avisados.push(rec.id);
    } catch (e) {
      Logger.log('No se pudo enviar el aviso del reclamo ' + rec.hoja + ': ' + e);
    }
  });
  if (!avisados.length) return;
  UrlFetchApp.fetch(urlWeb() + '/api/reclamos/notificados', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + claveWeb() },
    muteHttpExceptions: true,
    payload: JSON.stringify({ ids: avisados }),
  });
  Logger.log('Avisos de reclamos enviados: ' + avisados.length);
}

function enviarAvisoReclamo(rec) {
  var destino = CONFIG.CORREO_RECLAMOS || CONFIG.CORREO_DESTINO || Session.getEffectiveUser().getEmail();
  var tipo = rec.tipo === 'queja' ? 'Queja' : 'Reclamo';
  var limite = Utilities.formatDate(new Date(rec.fecha_limite + 'T12:00:00Z'), 'America/Lima', 'dd/MM/yyyy');
  var registrado = Utilities.formatDate(new Date(rec.creado_en), 'America/Lima', "dd/MM/yyyy 'a las' HH:mm");
  var asunto = 'LIBRO DE RECLAMACIONES | ' + tipo + ' N.° ' + rec.hoja + ' – responder antes del ' + limite;

  var filas = [
    ['Hoja N.°', rec.hoja],
    ['Registrado', registrado],
    ['Responder antes del', limite + ' (15 días hábiles; si hay feriados, el plazo es algo mayor)'],
    ['Tipo', tipo],
    ['Nombre', rec.nombre],
    [rec.tipo_documento, rec.numero_documento],
    ['Domicilio', rec.domicilio],
    ['Correo', rec.email],
    ['Teléfono', rec.telefono || '—'],
  ];
  if (rec.menor_de_edad) filas.push(['Padre, madre o apoderado', rec.apoderado || '—']);
  filas = filas.concat([
    ['Bien contratado', (rec.bien_tipo === 'producto' ? 'Producto' : 'Servicio') + ': ' + rec.descripcion_bien],
    ['Monto reclamado', rec.monto != null ? 'S/ ' + Number(rec.monto).toFixed(2) : '—'],
    ['Detalle', rec.detalle],
    ['Pedido', rec.pedido],
  ]);

  var texto = filas.map(function (f) { return f[0] + ': ' + f[1]; }).join('\n') +
    '\n\nRespóndele a ' + rec.email + ' y registra tu respuesta en Supabase → reclamaciones.';
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:640px">' +
    '<p style="background:#C52F12;color:#fff;font-weight:bold;padding:10px 14px;border-radius:8px;margin:0 0 14px">' +
    'Nuevo ' + tipo.toLowerCase() + ' en el Libro de Reclamaciones · responder antes del ' + limite + '</p>' +
    '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
    filas.map(function (f) {
      return '<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;vertical-align:top;width:170px">' + escaparHtml(String(f[0])) +
        '</td><td style="padding:8px;border-bottom:1px solid #eee;white-space:pre-wrap">' + escaparHtml(String(f[1])) + '</td></tr>';
    }).join('') +
    '</table>' +
    '<p style="color:#555;font-size:13px;margin-top:16px">Respóndele por correo a <a href="mailto:' + escaparHtml(rec.email) + '">' + escaparHtml(rec.email) +
    '</a> y luego, en Supabase → Table Editor → <b>reclamaciones</b>, completa <b>respuesta</b>, cambia <b>estado</b> a "respondido" y pon la fecha en <b>respondido_en</b>.</p>' +
    '</div>';

  MailApp.sendEmail({ to: destino, subject: asunto, body: texto, htmlBody: html, name: 'RumboBarato · Libro de Reclamaciones', replyTo: rec.email });
}


// ---------------------------------------------------------------------------
// Clientes Premium en el Google Sheet
// ---------------------------------------------------------------------------

var HOJA_ENVIAR_PREMIUM = 'Enviar ofertas Premium';
var HOJA_CLIENTES = 'Clientes Premium (todos)';
var ESTADOS_PLAN = {
  activo: 'Activo',
  por_vencer: 'Por vencer (≤ 3 días)',
  tolerancia: 'En tolerancia (venció, aún con acceso)',
  vencido: 'Vencido (no renovó)',
  free: 'Sin plan',
};

/**
 * Trae de la web la lista de clientes y reescribe las dos pestañas:
 * - "Enviar ofertas Premium": con acceso Premium hoy + aceptaron promociones + dejaron WhatsApp.
 * - "Clientes Premium (todos)": todos los que alguna vez pagaron, con su estado.
 * Corre sola cada 15 minutos dentro de revisarAlertas. Para actualizar ya, ejecútala a mano.
 */
function sincronizarClientes(forzar) {
  if (!urlWeb() || !claveWeb()) return;
  var props = PropertiesService.getScriptProperties();
  var ultima = Number(props.getProperty('CLIENTES_SINCRONIZADOS_EN') || 0);
  // Desde revisarAlertas llega forzar = false: solo actualiza si pasaron 15 minutos.
  if (forzar === false && Date.now() - ultima < 15 * 60 * 1000) return;

  var r = UrlFetchApp.fetch(urlWeb() + '/api/clientes', {
    headers: { Authorization: 'Bearer ' + claveWeb() },
    muteHttpExceptions: true,
  });
  if (r.getResponseCode() !== 200) {
    Logger.log('Clientes: ' + explicarRespuestaWeb(r.getResponseCode(), r.getContentText()));
    return;
  }
  var clientes = JSON.parse(r.getContentText()).clientes || [];
  var ss = obtenerSpreadsheet();
  var zona = 'America/Lima';
  var fecha = function (iso) { return iso ? Utilities.formatDate(new Date(iso), zona, 'dd/MM/yyyy') : ''; };
  var chat = function (n) { return n ? 'https://wa.me/' + String(n).replace(/\D/g, '') : ''; };

  var enviar = clientes.filter(function (c) { return c.enviar_ofertas; });
  escribirHoja(ss, HOJA_ENVIAR_PREMIUM,
    ['Nombre', 'WhatsApp', 'Abrir chat', 'Correo', 'Estado del plan', 'Vence el', 'Acceso hasta', 'Permiso desde'],
    enviar.map(function (c) {
      return [c.nombre, c.whatsapp, chat(c.whatsapp), c.email, ESTADOS_PLAN[c.estado] || c.estado,
        fecha(c.premium_hasta), fecha(c.acceso_hasta), fecha(c.promos_aceptadas_en)];
    }),
    'Clientes con acceso Premium hoy que aceptaron recibir promociones por WhatsApp. Actualizado: ' +
      Utilities.formatDate(new Date(), zona, "dd/MM/yyyy HH:mm") + ' · Total: ' + enviar.length);

  escribirHoja(ss, HOJA_CLIENTES,
    ['Nombre', 'Correo', 'WhatsApp', 'Estado del plan', '¿Recibe ofertas Premium?', 'Acepta promociones',
      'Vence el', 'Acceso hasta', 'Pagos', 'Total pagado (S/)', 'Último pago', 'Último medio'],
    clientes.map(function (c) {
      var motivo = c.enviar_ofertas ? 'Sí'
        : !c.acceso_premium ? 'No: plan vencido'
        : !c.acepta_promos ? 'No: no dio permiso'
        : 'No: falta WhatsApp';
      return [c.nombre, c.email, c.whatsapp, ESTADOS_PLAN[c.estado] || c.estado, motivo, c.acepta_promos ? 'Sí' : 'No',
        fecha(c.premium_hasta), fecha(c.acceso_hasta), c.cantidad_pagos, c.total_pagado, fecha(c.ultimo_pago), c.ultimo_medio];
    }),
    'Todos los clientes que alguna vez pagaron. Actualizado: ' + Utilities.formatDate(new Date(), zona, "dd/MM/yyyy HH:mm") +
      ' · Total: ' + clientes.length);

  props.setProperty('CLIENTES_SINCRONIZADOS_EN', String(Date.now()));
  Logger.log('Clientes actualizados: ' + clientes.length + ' en total, ' + enviar.length + ' para enviar ofertas Premium.');
}

/** Reescribe una pestaña: fila 1 = nota, fila 2 = títulos, desde la fila 3 = datos. */
function escribirHoja(ss, nombre, titulos, filas, nota) {
  var hoja = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  hoja.clear();
  hoja.getRange(1, 1).setValue(nota).setFontStyle('italic').setFontColor('#5D76A0');
  hoja.getRange(2, 1, 1, titulos.length).setValues([titulos]).setFontWeight('bold').setBackground('#FFE3DA');
  if (filas.length) {
    hoja.getRange(3, 1, filas.length, titulos.length).setValues(filas);
    // El WhatsApp como texto, para que Sheets no le quite el "+".
    var colWsp = titulos.indexOf('WhatsApp');
    if (colWsp >= 0) hoja.getRange(3, colWsp + 1, filas.length, 1).setNumberFormat('@').setValues(filas.map(function (f) { return [f[colWsp]]; }));
  }
  hoja.setFrozenRows(2);
  hoja.autoResizeColumns(1, titulos.length);
}

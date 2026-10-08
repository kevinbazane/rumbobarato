/**
 * RumboBarato — Extracción de datos de los correos de Google Flights.
 * Funciones puras (sin Gmail/Sheets) para poder probarlas fuera de Apps Script.
 */

var MESES_IDX = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, set: 8, oct: 9, nov: 10, dic: 11,
};
var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
var DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
var CODIGOS_NO_AEROPUERTO = { PEN: 1, USD: 1, EUR: 1, IDA: 1, VER: 1, LOS: 1, DEL: 1 };
var AEROLINEAS_SENSIBLES_A_MAYUSCULAS = {
  Azul: 1, GOL: 1, Copa: 1, Delta: 1, United: 1, American: 1, ANA: 1, Level: 1, Spirit: 1,
};

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------

/**
 * Analiza un correo y devuelve las ofertas encontradas (una por ruta + fechas),
 * eligiendo para cada una la opción más barata.
 */
function analizarCorreo(html, textoPlano, fechaCorreo) {
  var ref = fechaCorreo || new Date();
  var opciones = [];
  var cabeceraTexto;

  if (html) {
    // 1) Plantilla conocida de Google Flights; 2) links que contienen un precio.
    var tarjetas = extraerTarjetasPlantilla(html);
    if (!tarjetas.length) tarjetas = extraerTarjetasHtml(html);
    if (tarjetas.length) {
      var htmlSinTarjetas = html;
      tarjetas.forEach(function (t) { htmlSinTarjetas = htmlSinTarjetas.replace(t.htmlCompleto, '\n'); });
      cabeceraTexto = htmlATexto(htmlSinTarjetas);
      tarjetas.forEach(function (t) { opciones.push({ texto: t.texto, link: t.link }); });
    } else {
      cabeceraTexto = htmlATexto(html);
    }
  } else {
    cabeceraTexto = textoPlano || '';
  }

  var linkGeneral = primerLinkVuelos(html || textoPlano || '') || linkPorTexto(html || '', /ver (mas )?vuelos/);

  // Respaldo: si no hubo tarjetas enlazadas, cortar el texto por cada precio.
  if (!opciones.length) {
    opciones = segmentarPorPrecio(cabeceraTexto).map(function (texto) {
      return { texto: texto, link: primerLinkVuelos(texto) || linkGeneral };
    });
  }

  var cabecera = parsearBloque(cabeceraTexto, ref);
  var parseadas = opciones.map(function (op) {
    var tarjeta = parsearBloque(op.texto, ref);
    return combinar(tarjeta, cabecera, op.link || linkGeneral, op.texto);
  });

  return { ofertas: agruparOfertas(parseadas), opciones: parseadas, cabecera: cabecera };
}

/** Datos de la tarjeta con prioridad; lo que falte se toma de la cabecera del correo. */
function combinar(t, c, link, textoFuente) {
  var fechas = t.fechas.length >= 2 ? t.fechas : (c.fechas.length >= 2 ? c.fechas : (t.fechas.length ? t.fechas : c.fechas));
  var ruta = completarNombres(t.ruta, c.ruta) || c.ruta;
  var tipo = t.tipoViaje || c.tipoViaje || (fechas.length >= 2 ? 'ida_vuelta' : null);
  return {
    origen: ruta ? ruta.origen : null,
    destino: ruta ? ruta.destino : null,
    precio: t.precio || c.precio,
    ida: fechas[0] || null,
    vuelta: fechas.length >= 2 ? fechas[1] : null,
    escalas: t.escalas != null ? t.escalas : c.escalas,
    aerolinea: t.aerolinea || c.aerolinea,
    etiqueta: t.etiqueta || c.etiqueta,
    tipoViaje: tipo,
    link: link || null,
    textoFuente: textoFuente,
  };
}

/**
 * Si la tarjeta solo trae códigos desconocidos ("LIM–XYZ"), toma el nombre de
 * la ciudad de la cabecera del correo ("de Lima a Santiago de Chile").
 */
function completarNombres(rutaTarjeta, rutaCabecera) {
  if (!rutaTarjeta) return null;
  if (!rutaCabecera) return rutaTarjeta;
  var arreglar = function (a, b) {
    if (a.nombre !== a.codigo || !b || b.nombre === b.codigo) return a;
    return { codigo: a.codigo, nombre: b.nombre, nacional: a.nacional };
  };
  return {
    origen: arreglar(rutaTarjeta.origen, rutaCabecera.origen),
    destino: arreglar(rutaTarjeta.destino, rutaCabecera.destino),
  };
}

// ---------------------------------------------------------------------------
// Agrupación, filtros y mensaje
// ---------------------------------------------------------------------------

function claveOferta(o) {
  return [
    o.origen ? o.origen.codigo || o.origen.nombre : '?',
    o.destino ? o.destino.codigo || o.destino.nombre : '?',
    o.ida ? fechaIso(o.ida) : '?',
    o.vuelta ? fechaIso(o.vuelta) : '?',
  ].join('|').toUpperCase();
}

/** Ruta por ciudad (no por aeropuerto): Tokio-Narita y Tokio-Haneda son la misma ruta. */
function claveRuta(o) {
  return [
    o.origen ? normalizar(o.origen.nombre) : '?',
    o.destino ? normalizar(o.destino.nombre) : '?',
  ].join('|');
}

function esNacional(o) {
  return !!(o.origen && o.destino && o.origen.nacional && o.destino.nacional);
}

/**
 * Una sola oferta por ruta (origen + destino): la opción más barata del correo,
 * aunque venga con varias fechas. A igual precio, la de menos escalas y luego
 * la de fecha de ida más cercana. Si esa opción tiene demasiadas escalas, la
 * oferta se descarta en evaluarOferta.
 */
function agruparOfertas(opciones) {
  var grupos = {};
  var orden = [];
  opciones.forEach(function (o) {
    var k = claveRuta(o);
    if (!grupos[k]) { grupos[k] = []; orden.push(k); }
    grupos[k].push(o);
  });
  return orden.map(function (k) {
    var lista = grupos[k].slice().sort(function (a, b) {
      return (a.precio ? a.precio.valor : Infinity) - (b.precio ? b.precio.valor : Infinity) ||
        (a.escalas != null ? a.escalas : Infinity) - (b.escalas != null ? b.escalas : Infinity) ||
        (a.ida ? a.ida.getTime() : Infinity) - (b.ida ? b.ida.getTime() : Infinity);
    });
    var oferta = Object.assign({}, lista[0]);
    oferta.clave = claveOferta(oferta);
    oferta.numOpciones = lista.length;
    return oferta;
  });
}

/** Devuelve { estado: 'APTA' | 'DESCARTADA' | 'ERROR', motivo }. */
function evaluarOferta(o) {
  var faltan = [];
  if (!o.origen) faltan.push('origen');
  if (!o.destino) faltan.push('destino');
  if (!o.precio) faltan.push('precio');
  if (!o.ida) faltan.push('fecha de ida');
  if (!o.vuelta && o.tipoViaje !== 'solo_ida') faltan.push('fecha de vuelta');
  if (o.escalas == null) faltan.push('número de escalas');
  if (!o.aerolinea) faltan.push('aerolínea');
  if (!o.link) faltan.push('link de Google Flights');
  if (faltan.length) return { estado: 'ERROR', motivo: 'No se pudo extraer: ' + faltan.join(', ') };

  // Se aceptan rutas nacionales e internacionales; el alcance se indica en el correo.
  var motivos = [];
  if (o.etiqueta !== 'bajo') motivos.push('Etiqueta de precio no es "bajo" (' + (o.etiqueta || 'sin etiqueta clara') + ')');
  if (o.escalas > CONFIG.MAX_ESCALAS) motivos.push(o.escalas + ' escalas (máximo ' + CONFIG.MAX_ESCALAS + ')');
  if (o.tipoViaje !== 'ida_vuelta') motivos.push('No es ida y vuelta');
  if (o.precio.moneda !== 'PEN') motivos.push('Precio no está en soles (' + o.precio.simbolo + ')');
  if (motivos.length) return { estado: 'DESCARTADA', motivo: motivos.join('; ') };

  return { estado: 'APTA', motivo: '' };
}

function generarMensaje(o, linkPremium) {
  var nacional = esNacional(o);
  var lineas = [
    nacional ? '🇵🇪 ¡Oferta nacional detectada!' : '🌎 ¡Oferta internacional detectada!',
    '',
    o.origen.nombre + ' → ' + o.destino.nombre,
    'Desde S/ ' + formatearPrecio(o.precio.valor) + ' ida y vuelta',
    '',
    'Fechas: ' + formatearFecha(o.ida) + ' – ' + formatearFecha(o.vuelta),
    'Aerolínea: ' + o.aerolinea,
    '',
    'Esta tarifa puede subir en cualquier momento.',
    '',
    '👉 Ver y comprar: ' + o.link,
  ];
  if (nacional) {
    lineas.push(
      '',
      'En el plan Free solo recibes ofertas dentro de Perú.',
      '¿Quieres también internacionales? Pasa a Premium 👉 ' + linkPremium
    );
  }
  return lineas.join('\n');
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

var ENTIDADES = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '–', mdash: '—',
  rarr: '→', middot: '·', bull: '•', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó',
  uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  Ntilde: 'Ñ', uuml: 'ü', iexcl: '¡', iquest: '¿',
};

function decodificarEntidades(s) {
  return s
    .replace(/&#(\d+);/g, function (m, n) { return String.fromCodePoint(+n); })
    .replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCodePoint(parseInt(h, 16)); })
    .replace(/&([a-zA-Z]+);/g, function (m, n) { return ENTIDADES[n] != null ? ENTIDADES[n] : m; });
}

function htmlATexto(html) {
  var s = String(html)
    .replace(/<(head|style|script)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|td|th|li|h[1-6]|table|section)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  s = decodificarEntidades(s).replace(/ | | /g, ' ');
  return s.split('\n')
    .map(function (l) { return l.replace(/[ \t]+/g, ' ').trim(); })
    .filter(function (l) { return l; })
    .join('\n');
}

/** Saca el destino real de links de redirección (google.com/url?q=..., etc.). */
function limpiarLink(href) {
  var url = decodificarEntidades(String(href).trim());
  for (var i = 0; i < 3; i++) {
    var m = url.match(/[?&](?:q|url|u|r|dest|continue)=([^&]+)/i);
    if (!m) break;
    var interno = safeDecode(m[1]);
    if (!/^https?:\/\//i.test(interno)) break;
    url = interno;
  }
  if (!esLinkVuelos(url)) {
    var embebido = safeDecode(url).match(/https?:\/\/(?:www\.)?google\.[a-z.]+\/(?:travel\/)?flights[^\s"'<>]*/i);
    if (embebido) url = embebido[0];
  }
  return url;
}

function safeDecode(s) {
  try { return decodeURIComponent(s); } catch (e) { return s; }
}

function esLinkVuelos(url) {
  return /^https?:\/\/(?:www\.)?google\.[a-z.]+\/(?:travel\/)?flights/i.test(url) || /^https?:\/\/flights\.google\./i.test(url);
}

function primerLinkVuelos(contenido) {
  var re = /https?:\/\/[^\s"'<>]+/g;
  var m;
  while ((m = re.exec(contenido))) {
    var url = limpiarLink(m[0]);
    if (esLinkVuelos(url)) return url;
  }
  return null;
}

/** Todos los <a href> de un HTML (con o sin comillas): [{ href, html, texto }]. */
function enlacesHtml(html) {
  var re = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  var enlaces = [];
  var m;
  while ((m = re.exec(html))) {
    var href = limpiarLink(m[1] || m[2] || m[3] || '');
    if (!/^https?:\/\//i.test(href)) continue;
    enlaces.push({ href: href, html: m[0], texto: htmlATexto(m[4]) });
  }
  return enlaces;
}

/** Link de un <a> cuyo texto coincide (p. ej. "Ver más vuelos"). */
function linkPorTexto(html, patron) {
  var e = enlacesHtml(html).filter(function (x) { return patron.test(normalizar(x.texto)); })[0];
  return e ? e.href : null;
}

/**
 * Plantilla de alertas de Google Flights: cada opción es un bloque
 * "broadIntentMarketContentDiscountedMdp" con fechas, "Desde PEN 291", botón
 * "Ver" y "JetSMART · Directo · LIM–CUZ". Se corta cada bloque antes del
 * siguiente o antes de la sección de precios de referencia (rango típico).
 */
function extraerTarjetasPlantilla(html) {
  var reInicio = /<table\b[^>]*class\s*=\s*["']?[^"'>]*DiscountedMdp/gi;
  var inicios = [];
  var m;
  while ((m = reInicio.exec(html))) inicios.push(m.index);
  if (!inicios.length) return [];

  var finRe = /ReferencePrice|ViewMoreFlights|ContentFeedback/i;
  var tarjetas = [];
  inicios.forEach(function (inicio, i) {
    var fin = i + 1 < inicios.length ? inicios[i + 1] : html.length;
    var fragmento = html.slice(inicio, fin);
    var corte = fragmento.search(finRe);
    if (corte > 0) fragmento = fragmento.slice(0, fragmento.lastIndexOf('<', corte));
    var texto = htmlATexto(fragmento);
    if (!extraerPrecio(texto)) return;
    var enlaces = enlacesHtml(fragmento);
    var vuelos = enlaces.filter(function (e) { return esLinkVuelos(e.href); })[0];
    tarjetas.push({
      htmlCompleto: fragmento,
      texto: texto,
      link: (vuelos || enlaces[0] || {}).href || null,
    });
  });
  return tarjetas;
}

/** Cada <a> que contiene un precio se considera una opción de vuelo. */
function extraerTarjetasHtml(html) {
  return enlacesHtml(html)
    .filter(function (e) { return extraerPrecio(e.texto); })
    .map(function (e) { return { htmlCompleto: e.html, texto: e.texto, link: e.href }; });
}

/** Respaldo cuando no hay tarjetas enlazadas: un bloque por cada línea con precio. */
function segmentarPorPrecio(texto) {
  var bloques = [];
  var actual = [];
  texto.split('\n').forEach(function (linea) {
    actual.push(linea);
    if (extraerPrecio(linea)) { bloques.push(actual.join('\n')); actual = []; }
  });
  return bloques;
}

// ---------------------------------------------------------------------------
// Campos
// ---------------------------------------------------------------------------

function parsearBloque(texto, ref) {
  return {
    precio: extraerPrecio(texto),
    ruta: extraerRuta(texto),
    fechas: extraerFechas(texto, ref),
    escalas: extraerEscalas(texto),
    aerolinea: extraerAerolinea(texto),
    etiqueta: extraerEtiqueta(texto),
    tipoViaje: extraerTipoViaje(texto),
  };
}

function quitarTildes(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizar(s) {
  return quitarTildes(s).toLowerCase();
}

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Precio actual de un bloque. Ignora montos de ahorro ("bajó S/ 45",
 * "S/ 50 menos") y, si quedan varios (p. ej. precio anterior tachado), usa el menor.
 */
function extraerPrecio(texto) {
  var re = /(S\/\.?|PEN|US\$|USD|\$|€|EUR)\s?(\d[\d.,]*)/g;
  var candidatos = [];
  var m;
  while ((m = re.exec(texto))) {
    var antes = texto.slice(Math.max(0, m.index - 25), m.index).split('\n').pop();
    var despues = normalizar(texto.slice(m.index + m[0].length, m.index + m[0].length + 25));
    if (/(bajó|bajaron|ahorr\w*|descuento|menos|redujo|reducción)\s*(en\s*)?$/i.test(antes)) continue;
    if (/^\s*(menos|mas barat|de ahorro|de descuento|por debajo)/.test(despues)) continue;
    // Precios de referencia: "suelen valer entre PEN 270–425", "reservas por PEN 310".
    if (/\b(entre|valer|cuestan?|reservas? por|por)\s*$/i.test(antes)) continue;
    if (/^\s*[–—-]\s*\d/.test(despues) || /[–—-]\s*$/.test(antes)) continue;
    var valor = numeroDesdeTexto(m[2]);
    if (valor == null) continue;
    var simbolo = m[1];
    candidatos.push({
      valor: valor,
      simbolo: simbolo,
      moneda: /^(S\/|PEN)/.test(simbolo) ? 'PEN' : (simbolo === '€' || simbolo === 'EUR' ? 'EUR' : 'USD'),
    });
  }
  if (!candidatos.length) return null;
  candidatos.sort(function (a, b) { return a.valor - b.valor; });
  return candidatos[0];
}

function numeroDesdeTexto(s) {
  s = s.replace(/[.,]+$/, '');
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) s = s.replace(/[.,]/g, '');
  else if (/[.,]\d{1,2}$/.test(s)) s = s.replace(/[.,](?=\d{3})/g, '').replace(',', '.');
  else s = s.replace(/[.,]/g, '');
  var n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function buscarAeropuertoPorCodigo(codigo) {
  var a = AEROPUERTOS_PERU[codigo];
  if (a) return { codigo: codigo, nombre: a.nombre, nacional: true };
  return { codigo: codigo, nombre: AEROPUERTOS_INTERNACIONALES[codigo] || codigo, nacional: false };
}

function buscarAeropuertoPorNombre(nombre) {
  var n = normalizar(nombre).trim();
  for (var codigo in AEROPUERTOS_PERU) {
    if (AEROPUERTOS_PERU[codigo].alias.indexOf(n) >= 0) return buscarAeropuertoPorCodigo(codigo);
  }
  return { codigo: null, nombre: nombre.trim(), nacional: false };
}

function patronAliasPeru() {
  var alias = [];
  for (var codigo in AEROPUERTOS_PERU) alias = alias.concat(AEROPUERTOS_PERU[codigo].alias);
  alias.sort(function (a, b) { return b.length - a.length; });
  return alias.map(escaparRegex).join('|');
}

function extraerRuta(texto) {
  // 1) "Lima (LIM) ... Cusco (CUZ)"
  var codigos = [];
  var reParen = /\(([A-Z]{3})\)/g;
  var m;
  while ((m = reParen.exec(texto))) {
    if (!CODIGOS_NO_AEROPUERTO[m[1]] && codigos.indexOf(m[1]) < 0) codigos.push(m[1]);
  }
  if (codigos.length >= 2) {
    return { origen: buscarAeropuertoPorCodigo(codigos[0]), destino: buscarAeropuertoPorCodigo(codigos[1]) };
  }

  // 2) "LIM–CUZ" / "LIM → CUZ"
  var reCodigos = /\b([A-Z]{3})\s*(?:–|—|-|→|->|>)\s*([A-Z]{3})\b/g;
  while ((m = reCodigos.exec(texto))) {
    if (CODIGOS_NO_AEROPUERTO[m[1]] || CODIGOS_NO_AEROPUERTO[m[2]] || m[1] === m[2]) continue;
    return { origen: buscarAeropuertoPorCodigo(m[1]), destino: buscarAeropuertoPorCodigo(m[2]) };
  }

  // 3) Ciudades peruanas conocidas: "Lima a Cusco", "Lima → Cusco"
  var alias = patronAliasPeru();
  var reNombres = new RegExp('\\b(' + alias + ')\\b\\s*(?:\\([a-z]{3}\\))?\\s*(?:a|hacia|→|->|–|—|-)\\s*\\b(' + alias + ')\\b');
  var mn = normalizar(texto).match(reNombres);
  if (mn && mn[1] !== mn[2]) {
    return { origen: buscarAeropuertoPorNombre(mn[1]), destino: buscarAeropuertoPorNombre(mn[2]) };
  }

  // 4) Cualquier "de X a Y" / "X → Y" (para detectar rutas internacionales)
  var palabra = '[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñü]+(?: (?:de )?[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñü]+)*';
  var reGenerico = new RegExp('(?:\\bde |^|\\n)(' + palabra + ')(?: \\([A-Z]{3}\\))?\\s*(?: a |→|->)\\s*(' + palabra + ')');
  var mg = texto.match(reGenerico);
  if (mg && mg[1] !== mg[2]) {
    return { origen: buscarAeropuertoPorNombre(mg[1]), destino: buscarAeropuertoPorNombre(mg[2]) };
  }
  return null;
}

/** Fechas en orden de aparición: "jue, 15 oct", "15 de octubre de 2026", "15/10/2026". */
function extraerFechas(texto, ref) {
  var t = normalizar(texto);
  var encontrados = [];
  var reMes = /(\d{1,2})[ \t]*(?:de[ \t]+)?(ene(?:ro)?|feb(?:rero)?|mar(?:zo)?|abr(?:il)?|may(?:o)?|jun(?:io)?|jul(?:io)?|ago(?:sto)?|sep(?:tiembre)?|set(?:iembre)?|oct(?:ubre)?|nov(?:iembre)?|dic(?:iembre)?)\.?(?:,?[ \t]+(?:de[ \t]+)?(\d{4}))?(?![a-z])/g;
  var m;
  while ((m = reMes.exec(t))) {
    var previo = t.slice(Math.max(0, m.index - 4), m.index);
    if (/\d$|[\/$]\s*$|s\/\s*$/.test(previo)) continue;
    encontrados.push({ pos: m.index, dia: +m[1], mes: MESES_IDX[m[2].slice(0, 3)], anio: m[3] ? +m[3] : null });
  }
  var reNum = /(?:^|[^\d\/])(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?![\d\/])/g;
  while ((m = reNum.exec(t))) {
    var anio = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : null;
    encontrados.push({ pos: m.index, dia: +m[1], mes: +m[2] - 1, anio: anio });
  }
  encontrados.sort(function (a, b) { return a.pos - b.pos; });

  var fechas = [];
  encontrados.forEach(function (e) {
    if (e.mes < 0 || e.mes > 11 || e.dia < 1 || e.dia > 31) return;
    var anio = e.anio || ref.getFullYear();
    var f = new Date(anio, e.mes, e.dia);
    if (!e.anio && f.getTime() < ref.getTime() - 30 * 864e5) f = new Date(anio + 1, e.mes, e.dia);
    var ultima = fechas[fechas.length - 1];
    if (!ultima || ultima.getTime() !== f.getTime()) fechas.push(f);
  });
  return fechas;
}

function extraerEscalas(texto) {
  var t = normalizar(texto);
  var valores = [];
  // "Escalas" y "paradas" significan lo mismo.
  if (/\bsin (escalas?|paradas?)\b|\bvuelo directo\b|\bdirecto\b|\bnonstop\b/.test(t)) valores.push(0);
  var re = /\b(\d+|una|un|dos|tres)\s+(?:escalas?|paradas?)\b/g;
  var palabras = { un: 1, una: 1, dos: 2, tres: 3 };
  var m;
  while ((m = re.exec(t))) valores.push(palabras[m[1]] != null ? palabras[m[1]] : +m[1]);
  return valores.length ? Math.max.apply(null, valores) : null;
}

function extraerAerolinea(texto) {
  var sinTildes = quitarTildes(texto);
  var mejor = null;
  AEROLINEAS.forEach(function (nombre) {
    var flags = AEROLINEAS_SENSIBLES_A_MAYUSCULAS[nombre] ? '' : 'i';
    var re = new RegExp('(^|[^A-Za-z])' + escaparRegex(quitarTildes(nombre)) + '(?![A-Za-z])', flags);
    var m = re.exec(sinTildes);
    if (!m) return;
    var pos = m.index + m[1].length;
    if (!mejor || pos < mejor.pos || (pos === mejor.pos && nombre.length > mejor.nombre.length)) {
      mejor = { pos: pos, nombre: nombre };
    }
  });
  if (mejor) return mejor.nombre;

  // Respaldo: línea tipo "Japan Airlines, LATAM · 1 parada · LIM–NRT · 25 h";
  // la aerolínea es lo que va antes del primer "·" (si hay varias, la primera).
  var lineas = texto.split('\n');
  for (var i = 0; i < lineas.length; i++) {
    var partes = lineas[i].split('·').map(function (p) { return p.trim(); }).filter(function (p) { return p; });
    if (partes.length < 2) continue;
    var resto = partes.slice(1).join(' · ');
    if (!/sin (escalas?|paradas?)|directo|\d+\s*(escalas?|paradas?)|\b[A-Z]{3}\s*[–—-]\s*[A-Z]{3}\b/i.test(quitarTildes(resto))) continue;
    var nombre = partes[0].split(/,|\s+y\s+|\s+e\s+/)[0].trim();
    if (nombre && nombre.length <= 40 && !/\d|:/.test(nombre)) return nombre;
  }
  return null;
}

/**
 * Etiqueta de precio: 'bajo' | 'tipico' | 'alto' | 'ambigua' | null.
 * Se basa en frases explícitas ("Los precios son bajos", "Precio bajo") y,
 * si no hay, en "más barato / más económico de lo habitual". No confunde "el precio más bajo"
 * (la opción más barata) ni "el precio bajó" (verbo) con la etiqueta.
 */
function extraerEtiqueta(texto) {
  var t = normalizar(String(texto).replace(/baj[óÓ]|bajaron|bajado/gi, ' __verbo__ '));
  var categorias = {};
  var mapa = function (palabra) {
    if (/^baj/.test(palabra)) return 'bajo';
    if (/^(tipic|habitual|normal|estandar)/.test(palabra)) return 'tipico';
    return 'alto';
  };

  var reFrase = /\b(?:precios?|tarifas?)\b((?:\s+[a-z_]+){0,5}?)\s+(bajos?|bajas?|tipicos?|tipicas?|habituales|normales|estandar(?:es)?|altos?|altas?|elevad[oa]s?)\b/g;
  var m;
  while ((m = reFrase.exec(t))) {
    var intermedias = m[1].trim().split(/\s+/);
    if (intermedias.some(function (p) { return /^(mas|menos|que|lo|de|del|y|o)$/.test(p); })) continue;
    categorias[mapa(m[2])] = true;
  }
  t.split('\n').forEach(function (linea) {
    var l = linea.trim();
    var ml = l.match(/^(?:precio\s+)?(bajo|tipico|alto)$/);
    if (ml) categorias[mapa(ml[1])] = true;
  });

  var lista = Object.keys(categorias);
  if (lista.length === 1) return lista[0];
  if (lista.length > 1) return 'ambigua';

  var bajoIndirecto = /\bmas (bajos?|bajas?|barat[oa]s?|economic[oa]s?) (de|que|del) (lo )?(habitual|normal|usual)/.test(t);
  var altoIndirecto = /\bmas (altos?|altas?|car[oa]s?) (de|que|del) (lo )?(habitual|normal|usual)/.test(t);
  if (bajoIndirecto && !altoIndirecto) return 'bajo';
  if (altoIndirecto && !bajoIndirecto) return 'alto';
  return null;
}

function extraerTipoViaje(texto) {
  var t = normalizar(texto);
  var vuelta = /\bida y vuelta\b|\bida\/vuelta\b|\bround trip\b/.test(t);
  var soloIda = /\bsolo (de )?ida\b|\bone way\b/.test(t);
  if (vuelta && !soloIda) return 'ida_vuelta';
  if (soloIda && !vuelta) return 'solo_ida';
  return null;
}

// ---------------------------------------------------------------------------
// Formato
// ---------------------------------------------------------------------------

function fechaIso(f) {
  var mm = ('0' + (f.getMonth() + 1)).slice(-2);
  var dd = ('0' + f.getDate()).slice(-2);
  return f.getFullYear() + '-' + mm + '-' + dd;
}

function formatearFecha(f) {
  return DIAS_CORTOS[f.getDay()] + ' ' + f.getDate() + ' ' + MESES_CORTOS[f.getMonth()];
}

function formatearPrecio(n) {
  var entero = Math.floor(n);
  var dec = Math.round((n - entero) * 100);
  var s = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec ? s + '.' + ('0' + dec).slice(-2) : s;
}

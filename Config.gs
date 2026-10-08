/**
 * RumboBarato — Configuración
 * Edita solo este archivo para ajustar el comportamiento.
 */

var CONFIG = {
  // Link al plan Premium que aparece al final del mensaje.
  LINK_PREMIUM: 'https://REEMPLAZA-ESTE-LINK-PREMIUM',

  // Búsqueda de Gmail para encontrar las alertas de Google Flights.
  // Google Flights envía las alertas desde noreply-travel@google.com.
  GMAIL_QUERY: 'from:(noreply-travel@google.com) newer_than:3d',

  // Máximo de correos a revisar por ejecución.
  MAX_CORREOS_POR_EJECUCION: 30,

  // Ventana anti-duplicados (horas).
  HORAS_DEDUPE: 48,

  // Máximo de escalas permitidas.
  MAX_ESCALAS: 1,

  // Cada cuántos minutos se revisa Gmail (1, 5, 10, 15 o 30).
  MINUTOS_ENTRE_REVISIONES: 5,

  // Correo donde recibirás los mensajes listos. Vacío = tu propio correo.
  CORREO_DESTINO: '',

  // Nombre del Google Sheet de registro (se crea solo la primera vez).
  NOMBRE_SHEET: 'RumboBarato - Registro de ofertas',

  // Acortar el link de Google Flights en el mensaje (con TinyURL; si falla, se usa el link completo).
  // Solo se usa si la web no está configurada o no responde.
  ACORTAR_LINKS: true,

  // Tu web RumboBarato (sin "/" al final). Cada oferta aprobada se publica allí y el
  // mensaje lleva el link a la web (por ejemplo https://rumbobarato.com/o/x7k2pq).
  // Vacío = no publicar en la web.
  WEB_URL: '',

  // La misma clave que pusiste en la web como OFERTAS_API_SECRET.
  WEB_API_SECRET: '',
};

// Aeropuertos nacionales de Perú: código IATA -> nombre a mostrar + alias de búsqueda.
var AEROPUERTOS_PERU = {
  LIM: { nombre: 'Lima', alias: ['lima', 'jorge chavez', 'callao'] },
  CUZ: { nombre: 'Cusco', alias: ['cusco', 'cuzco', 'velasco astete'] },
  AQP: { nombre: 'Arequipa', alias: ['arequipa'] },
  PIU: { nombre: 'Piura', alias: ['piura'] },
  TRU: { nombre: 'Trujillo', alias: ['trujillo'] },
  CIX: { nombre: 'Chiclayo', alias: ['chiclayo'] },
  IQT: { nombre: 'Iquitos', alias: ['iquitos'] },
  PCL: { nombre: 'Pucallpa', alias: ['pucallpa'] },
  TPP: { nombre: 'Tarapoto', alias: ['tarapoto'] },
  JUL: { nombre: 'Juliaca', alias: ['juliaca', 'puno'] },
  TCQ: { nombre: 'Tacna', alias: ['tacna'] },
  AYP: { nombre: 'Ayacucho', alias: ['ayacucho'] },
  TBP: { nombre: 'Tumbes', alias: ['tumbes'] },
  JAU: { nombre: 'Jauja', alias: ['jauja', 'huancayo'] },
  CJA: { nombre: 'Cajamarca', alias: ['cajamarca'] },
  PEM: { nombre: 'Puerto Maldonado', alias: ['puerto maldonado'] },
  HUU: { nombre: 'Huánuco', alias: ['huanuco'] },
  ANS: { nombre: 'Andahuaylas', alias: ['andahuaylas'] },
  CHM: { nombre: 'Chimbote', alias: ['chimbote'] },
  TYL: { nombre: 'Talara', alias: ['talara'] },
  JAE: { nombre: 'Jaén', alias: ['jaen'] },
  PIO: { nombre: 'Pisco', alias: ['pisco'] },
  ILQ: { nombre: 'Ilo', alias: ['ilo'] },
  ATA: { nombre: 'Huaraz', alias: ['huaraz'] },
  CHH: { nombre: 'Chachapoyas', alias: ['chachapoyas'] },
  TGI: { nombre: 'Tingo María', alias: ['tingo maria'] },
};

// Aeropuertos internacionales: código IATA -> nombre de la ciudad que se muestra.
// Si un código no está aquí, se usa el nombre de ciudad que trae el correo ("de Lima a ...").
var AEROPUERTOS_INTERNACIONALES = {
  // Sudamérica
  SCL: 'Santiago de Chile', ARI: 'Arica', CJC: 'Calama', IQQ: 'Iquique', ANF: 'Antofagasta', PUQ: 'Punta Arenas',
  EZE: 'Buenos Aires', AEP: 'Buenos Aires', COR: 'Córdoba', MDZ: 'Mendoza', BRC: 'Bariloche', IGR: 'Puerto Iguazú',
  GRU: 'São Paulo', CGH: 'São Paulo', VCP: 'São Paulo', GIG: 'Río de Janeiro', SDU: 'Río de Janeiro',
  FLN: 'Florianópolis', SSA: 'Salvador de Bahía', BSB: 'Brasilia', IGU: 'Foz de Iguazú', FOR: 'Fortaleza', REC: 'Recife',
  BOG: 'Bogotá', MDE: 'Medellín', CTG: 'Cartagena', CLO: 'Cali', ADZ: 'San Andrés', SMR: 'Santa Marta',
  UIO: 'Quito', GYE: 'Guayaquil', GPS: 'Galápagos', LPB: 'La Paz', VVI: 'Santa Cruz', CBB: 'Cochabamba',
  ASU: 'Asunción', MVD: 'Montevideo', PDP: 'Punta del Este', CCS: 'Caracas',
  // Centroamérica y Caribe
  PTY: 'Panamá', SJO: 'San José', LIR: 'Liberia', SAL: 'San Salvador', GUA: 'Ciudad de Guatemala',
  CUN: 'Cancún', MEX: 'Ciudad de México', NLU: 'Ciudad de México', GDL: 'Guadalajara', MTY: 'Monterrey',
  PUJ: 'Punta Cana', SDQ: 'Santo Domingo', HAV: 'La Habana', VRA: 'Varadero', AUA: 'Aruba', CUR: 'Curazao',
  MBJ: 'Montego Bay', SJU: 'San Juan',
  // Norteamérica
  MIA: 'Miami', FLL: 'Fort Lauderdale', MCO: 'Orlando', TPA: 'Tampa', JFK: 'Nueva York', EWR: 'Nueva York',
  LGA: 'Nueva York', LAX: 'Los Ángeles', SFO: 'San Francisco', LAS: 'Las Vegas', IAH: 'Houston', DFW: 'Dallas',
  ATL: 'Atlanta', ORD: 'Chicago', IAD: 'Washington', BOS: 'Boston', YYZ: 'Toronto', YUL: 'Montreal', YVR: 'Vancouver',
  // Europa
  MAD: 'Madrid', BCN: 'Barcelona', LIS: 'Lisboa', OPO: 'Oporto', CDG: 'París', ORY: 'París', LHR: 'Londres',
  LGW: 'Londres', STN: 'Londres', AMS: 'Ámsterdam', FRA: 'Fráncfort', MUC: 'Múnich', BER: 'Berlín',
  FCO: 'Roma', MXP: 'Milán', LIN: 'Milán', VCE: 'Venecia', ZRH: 'Zúrich', BRU: 'Bruselas', IST: 'Estambul',
  ATH: 'Atenas', PRG: 'Praga', VIE: 'Viena', DUB: 'Dublín',
  // Asia, Medio Oriente y Oceanía
  NRT: 'Tokio', HND: 'Tokio', KIX: 'Osaka', ICN: 'Seúl', PEK: 'Pekín', PKX: 'Pekín', PVG: 'Shanghái',
  HKG: 'Hong Kong', BKK: 'Bangkok', SIN: 'Singapur', DXB: 'Dubái', DOH: 'Doha', TLV: 'Tel Aviv', DEL: 'Nueva Delhi',
  SYD: 'Sídney', MEL: 'Melbourne', AKL: 'Auckland', CAI: 'El Cairo',
};

// Aerolíneas conocidas (se toma la primera que aparezca como "principal").
// Si no está en la lista, se toma el nombre que aparece antes de "· Directo / · 1 parada".
var AEROLINEAS = [
  'LATAM', 'Sky Airline', 'Sky', 'JetSMART', 'Star Perú', 'ATSA', 'Avianca',
  'Copa Airlines', 'Copa', 'Aerolíneas Argentinas', 'American Airlines', 'American',
  'United', 'Delta', 'Iberia', 'Air Europa', 'KLM', 'Air France', 'Aeroméxico',
  'Arajet', 'Wingo', 'GOL', 'Azul', 'Boliviana de Aviación', 'Amaszonas', 'Viva Air',
  'Plus Ultra', 'Level', 'Lufthansa', 'British Airways', 'Air Canada', 'Turkish Airlines',
  'Emirates', 'Qatar Airways', 'Japan Airlines', 'ANA', 'Korean Air', 'Cathay Pacific',
  'Singapore Airlines', 'Ethiopian', 'Spirit', 'Volaris', 'Viva Aerobus', 'Paranair',
];

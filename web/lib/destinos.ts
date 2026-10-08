/**
 * Guías de viaje por destino. La clave es el nombre normalizado (minúsculas, sin tildes)
 * tal como lo envía Apps Script (Config.gs → AEROPUERTOS_PERU → nombre).
 */
export interface GuiaDestino {
  nombre: string;
  region: string;
  lema: string;
  descripcion: string;
  mejorEpoca: string;
  clima: string;
  altura?: string;
  imperdibles: { titulo: string; texto: string }[];
  consejos: string[];
  desdeAeropuerto: string;
  /** Búsqueda para fotos (Unsplash) y título del artículo de Wikipedia (respaldo). */
  fotos: { busqueda: string; wikipedia: string };
  /** true si no hay guía escrita para este destino (se muestra solo lo general). */
  generica?: boolean;
}

export function normalizarDestino(nombre: string): string {
  return nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const G: Record<string, GuiaDestino> = {
  cusco: {
    nombre: 'Cusco', region: 'Cusco',
    lema: 'La capital del imperio inca',
    descripcion: 'Calles empedradas sobre muros incas, iglesias coloniales y la puerta de entrada a Machu Picchu y al Valle Sagrado. Un destino que se vive a otro ritmo, a más de 3,000 metros de altura.',
    mejorEpoca: 'De mayo a septiembre (temporada seca, cielos despejados). En junio se celebra el Inti Raymi.',
    clima: 'Días soleados y noches frías todo el año; de diciembre a marzo llueve con frecuencia.',
    altura: '3,399 m s. n. m.',
    imperdibles: [
      { titulo: 'Machu Picchu', texto: 'La ciudadela inca más famosa del mundo. Llegas en tren desde Ollantaytambo o Cusco hasta Aguas Calientes.' },
      { titulo: 'Valle Sagrado', texto: 'Pisac, Ollantaytambo, Moray y las salineras de Maras en un día de recorrido.' },
      { titulo: 'Sacsayhuamán', texto: 'Fortaleza inca con piedras gigantes, a pocos minutos del centro.' },
      { titulo: 'Barrio de San Blas', texto: 'Talleres de artesanos, cafés y miradores sobre la ciudad.' },
      { titulo: 'Montaña de 7 Colores', texto: 'Vinicunca, una caminata exigente con un paisaje único.' },
    ],
    consejos: [
      'Tómate el primer día con calma para aclimatarte a la altura; el mate de coca ayuda.',
      'Compra las entradas a Machu Picchu y el tren con anticipación, sobre todo de mayo a agosto.',
      'El Boleto Turístico del Cusco agrupa la entrada a muchos sitios arqueológicos y museos.',
      'Lleva ropa en capas: el sol quema al mediodía y por la noche hace frío.',
    ],
    desdeAeropuerto: 'El aeropuerto Velasco Astete está a unos 15–20 minutos en taxi de la Plaza de Armas.',
    fotos: { busqueda: 'Cusco Peru', wikipedia: 'Cusco' },
  },
  arequipa: {
    nombre: 'Arequipa', region: 'Arequipa',
    lema: 'La Ciudad Blanca',
    descripcion: 'Un centro histórico de sillar volcánico, custodiado por el Misti, y una de las mejores cocinas regionales del país. Punto de partida al Cañón del Colca.',
    mejorEpoca: 'Todo el año; de abril a noviembre hay más días despejados.',
    clima: 'Soleado y seco casi todo el año; noches frescas. Lluvias ocasionales de enero a marzo.',
    altura: '2,335 m s. n. m.',
    imperdibles: [
      { titulo: 'Monasterio de Santa Catalina', texto: 'Una ciudad dentro de la ciudad, con calles de colores intensos.' },
      { titulo: 'Cañón del Colca', texto: 'Uno de los cañones más profundos del mundo y el vuelo de los cóndores en la Cruz del Cóndor.' },
      { titulo: 'Mirador de Yanahuara', texto: 'Arcos de sillar con vista al Misti, el Chachani y el Pichu Pichu.' },
      { titulo: 'Picanterías', texto: 'Rocoto relleno, chupe de camarones, adobo arequipeño y queso helado.' },
    ],
    consejos: [
      'Usa bloqueador y lentes de sol: la radiación es muy alta.',
      'Para el Colca conviene un tour de 2 días para no hacer todo de golpe.',
      'Muchas picanterías tradicionales abren solo a la hora del almuerzo.',
    ],
    desdeAeropuerto: 'El aeropuerto Rodríguez Ballón está a unos 25–30 minutos en taxi del centro.',
    fotos: { busqueda: 'Arequipa Peru', wikipedia: 'Arequipa' },
  },
  piura: {
    nombre: 'Piura', region: 'Piura',
    lema: 'Sol, playa y la mejor sazón norteña',
    descripcion: 'La ciudad del eterno verano y puerta de entrada a las playas más famosas del norte: Máncora, Vichayito, Los Órganos y Colán.',
    mejorEpoca: 'De diciembre a abril para playa a pleno sol; el resto del año también hace calor.',
    clima: 'Cálido y seco, con temperaturas altas casi todo el año.',
    imperdibles: [
      { titulo: 'Máncora y Vichayito', texto: 'Playas de arena clara, surf y atardeceres (a unas 3 horas por carretera).' },
      { titulo: 'Catacaos', texto: 'Pueblo de artesanos en filigrana de oro y plata, y picanterías tradicionales.' },
      { titulo: 'Colán', texto: 'Una de las playas más antiguas del Perú, con la iglesia colonial San Lucas.' },
      { titulo: 'Gastronomía', texto: 'Seco de chabelo, cebiche de mero y la clarita de chicha.' },
    ],
    consejos: [
      'Si vas directo a Máncora, compara con vuelos a Talara: queda más cerca.',
      'Lleva bloqueador, sombrero y mucha agua.',
      'En Catacaos regatea con amabilidad: es parte de la costumbre.',
    ],
    desdeAeropuerto: 'El aeropuerto Concha Iberico está dentro de la ciudad, a unos 10 minutos del centro.',
    fotos: { busqueda: 'Mancora Peru beach', wikipedia: 'Piura' },
  },
  trujillo: {
    nombre: 'Trujillo', region: 'La Libertad',
    lema: 'La ciudad de la eterna primavera',
    descripcion: 'Casonas coloniales de colores, la marinera y algunos de los sitios prehispánicos más impresionantes de la costa, como Chan Chan.',
    mejorEpoca: 'Todo el año. A fines de enero es el Concurso Nacional de Marinera.',
    clima: 'Templado y agradable todo el año, con poca lluvia.',
    imperdibles: [
      { titulo: 'Chan Chan', texto: 'La ciudad de barro más grande de América, capital del reino Chimú.' },
      { titulo: 'Huacas del Sol y de la Luna', texto: 'Templos mochicas con murales de colores muy bien conservados.' },
      { titulo: 'Huanchaco', texto: 'Playa de surf y caballitos de totora, con buenos restaurantes de pescado.' },
      { titulo: 'Plaza de Armas', texto: 'Una de las más coloridas del país, rodeada de casonas coloniales.' },
    ],
    consejos: [
      'Hospédate en Huanchaco si buscas un ambiente de playa más relajado.',
      'Prueba el shámbar (los lunes) y el cebiche de la zona.',
    ],
    desdeAeropuerto: 'El aeropuerto Carlos Martínez de Pinillos está a unos 15–20 minutos del centro y muy cerca de Huanchaco.',
    fotos: { busqueda: 'Trujillo Peru', wikipedia: 'Trujillo (Perú)' },
  },
  chiclayo: {
    nombre: 'Chiclayo', region: 'Lambayeque',
    lema: 'La capital de la amistad',
    descripcion: 'Tierra del Señor de Sipán y de pirámides de barro milenarias, con una cocina norteña que vale el viaje por sí sola.',
    mejorEpoca: 'Todo el año; de diciembre a marzo es temporada de playa en Pimentel.',
    clima: 'Cálido y seco, con brisa marina.',
    imperdibles: [
      { titulo: 'Museo Tumbas Reales de Sipán', texto: 'En Lambayeque, con el tesoro del Señor de Sipán. Uno de los mejores museos del país.' },
      { titulo: 'Pirámides de Túcume', texto: 'Un valle con 26 pirámides de adobe y un mirador espectacular.' },
      { titulo: 'Playa Pimentel', texto: 'Muelle histórico y pescadores en caballitos de totora.' },
      { titulo: 'Arroz con pato', texto: 'El plato bandera de la región. Y para el regreso, un King Kong de manjar blanco.' },
    ],
    consejos: [
      'Los museos suelen cerrar los lunes: revisa horarios antes de ir.',
      'Lambayeque y Túcume se recorren bien en un día desde Chiclayo.',
    ],
    desdeAeropuerto: 'El aeropuerto José Quiñones está a unos 10 minutos del centro.',
    fotos: { busqueda: 'Chiclayo Peru', wikipedia: 'Chiclayo' },
  },
  iquitos: {
    nombre: 'Iquitos', region: 'Loreto',
    lema: 'La puerta de la Amazonía',
    descripcion: 'La ciudad más grande del mundo a la que no se llega por carretera. Ríos inmensos, selva, delfines rosados y una vida que gira alrededor del Amazonas.',
    mejorEpoca: 'Todo el año. De diciembre a mayo (creciente) se navega más por la selva inundada; de junio a noviembre (vaciante) hay más caminatas.',
    clima: 'Cálido y húmedo todo el año, con lluvias frecuentes y breves.',
    imperdibles: [
      { titulo: 'Albergues en la selva', texto: 'Dos o tres noches en un lodge para caminatas, pesca y avistamiento de fauna.' },
      { titulo: 'Mercado de Belén', texto: 'Frutas, pescados y productos amazónicos que no verás en otro lado.' },
      { titulo: 'Pilpintuwasi', texto: 'Mariposario y centro de rescate de animales amazónicos.' },
      { titulo: 'Reserva Pacaya Samiria', texto: 'Una de las áreas protegidas más grandes del Perú, ideal para expediciones.' },
    ],
    consejos: [
      'Consulta con tu médico la vacuna contra la fiebre amarilla al menos 10 días antes.',
      'Lleva repelente, ropa ligera de manga larga y un impermeable.',
      'Muévete en mototaxi: es el transporte más práctico de la ciudad.',
    ],
    desdeAeropuerto: 'El aeropuerto Francisco Secada Vignetta está a unos 20 minutos del centro.',
    fotos: { busqueda: 'Amazon river Iquitos', wikipedia: 'Iquitos' },
  },
  pucallpa: {
    nombre: 'Pucallpa', region: 'Ucayali',
    lema: 'Selva a orillas del Ucayali',
    descripcion: 'Una ciudad amazónica animada, con lagunas tranquilas y la cultura shipibo-konibo muy presente.',
    mejorEpoca: 'De mayo a octubre, con menos lluvias.',
    clima: 'Cálido y húmedo todo el año.',
    imperdibles: [
      { titulo: 'Laguna Yarinacocha', texto: 'Paseos en bote, delfines de río y comunidades shipibas.' },
      { titulo: 'Artesanía shipibo-konibo', texto: 'Telas y cerámicas con los famosos diseños kené.' },
      { titulo: 'Malecón del Ucayali', texto: 'Atardeceres sobre el río y comida regional.' },
    ],
    consejos: [
      'Lleva repelente y consulta la vacuna contra la fiebre amarilla.',
      'Prueba el juane y el tacacho con cecina.',
    ],
    desdeAeropuerto: 'El aeropuerto David Abensur está a unos 15 minutos del centro.',
    fotos: { busqueda: 'Pucallpa Peru', wikipedia: 'Pucallpa' },
  },
  tarapoto: {
    nombre: 'Tarapoto', region: 'San Martín',
    lema: 'La ciudad de las palmeras',
    descripcion: 'Selva alta con cataratas, lagunas y cacao de primera, sin el calor extremo de la llanura amazónica.',
    mejorEpoca: 'De junio a octubre, con menos lluvias.',
    clima: 'Cálido y húmedo, más fresco por las noches.',
    imperdibles: [
      { titulo: 'Laguna Azul', texto: 'En Sauce, para paseos en bote y deportes acuáticos.' },
      { titulo: 'Catarata de Ahuashiyacu', texto: 'A pocos minutos de la ciudad, con pozas para bañarse.' },
      { titulo: 'Lamas', texto: 'Pueblo con un castillo curioso y el barrio nativo Wayku.' },
      { titulo: 'Chocolate y cacao', texto: 'Visita una planta de cacao y prueba chocolate de origen.' },
    ],
    consejos: [
      'Lleva repelente y ropa ligera.',
      'Para recorrer cataratas y lagunas, conviene contratar un tour o un auto con chofer.',
    ],
    desdeAeropuerto: 'El aeropuerto Cadete FAP Guillermo del Castillo está a unos 10 minutos del centro.',
    fotos: { busqueda: 'Tarapoto Peru', wikipedia: 'Tarapoto' },
  },
  juliaca: {
    nombre: 'Juliaca', region: 'Puno',
    lema: 'La puerta al Lago Titicaca',
    descripcion: 'El aeropuerto de Juliaca es la entrada a Puno y al Lago Titicaca, el lago navegable más alto del mundo, con islas flotantes y tradiciones vivas.',
    mejorEpoca: 'De mayo a octubre (seco). En febrero se celebra la Fiesta de la Virgen de la Candelaria.',
    clima: 'Frío y seco; días soleados y noches heladas.',
    altura: 'Más de 3,800 m s. n. m.',
    imperdibles: [
      { titulo: 'Islas de los Uros', texto: 'Islas flotantes construidas con totora sobre el Titicaca.' },
      { titulo: 'Taquile y Amantaní', texto: 'Comunidades con textilería reconocida por la UNESCO; puedes dormir en casa de una familia.' },
      { titulo: 'Sillustani', texto: 'Torres funerarias (chullpas) frente a la laguna Umayo.' },
    ],
    consejos: [
      'La altura es mayor que en Cusco: descansa el primer día y toma mate de coca.',
      'Lleva abrigo de verdad, gorro y guantes, sobre todo de junio a agosto.',
    ],
    desdeAeropuerto: 'El aeropuerto Inca Manco Cápac está en Juliaca; a Puno hay aproximadamente 1 hora en bus o traslado.',
    fotos: { busqueda: 'Lake Titicaca Puno', wikipedia: 'Lago Titicaca' },
  },
  tacna: {
    nombre: 'Tacna', region: 'Tacna',
    lema: 'La ciudad heroica',
    descripcion: 'Ciudad de frontera con buen clima, viñedos, petroglifos y fama de buenas compras.',
    mejorEpoca: 'Todo el año.',
    clima: 'Templado y seco; sol casi todos los días.',
    imperdibles: [
      { titulo: 'Arco Parabólico y Paseo Cívico', texto: 'El corazón de la ciudad.' },
      { titulo: 'Petroglifos de Miculla', texto: 'Cientos de grabados en roca y puentes colgantes.' },
      { titulo: 'Valle Viejo', texto: 'Bodegas de vino y pisco y picanterías tradicionales.' },
    ],
    consejos: [
      'Si vas a cruzar a Arica (Chile), lleva tu DNI vigente.',
      'Prueba el picante a la tacneña.',
    ],
    desdeAeropuerto: 'El aeropuerto Carlos Ciriani está a unos 10 minutos del centro.',
    fotos: { busqueda: 'Tacna Peru', wikipedia: 'Tacna' },
  },
  ayacucho: {
    nombre: 'Ayacucho', region: 'Ayacucho',
    lema: 'La ciudad de las 33 iglesias',
    descripcion: 'Arte popular, iglesias coloniales y una de las Semanas Santas más famosas de Sudamérica.',
    mejorEpoca: 'De abril a octubre; Semana Santa si buscas la gran fiesta.',
    clima: 'Templado y seco, con lluvias de diciembre a marzo.',
    altura: '2,761 m s. n. m.',
    imperdibles: [
      { titulo: 'Centro histórico', texto: 'Iglesias coloniales y la Plaza Mayor, de las más bonitas del país.' },
      { titulo: 'Pampa de la Quinua', texto: 'Escenario de la Batalla de Ayacucho, con un obelisco y un pueblo de artesanos.' },
      { titulo: 'Complejo Wari', texto: 'Restos de la capital del imperio Wari.' },
      { titulo: 'Retablos ayacuchanos', texto: 'Visita los talleres del barrio de Santa Ana.' },
    ],
    consejos: [
      'En Semana Santa los hoteles se llenan: reserva con tiempo.',
      'Prueba el puca picante y la qapchi.',
    ],
    desdeAeropuerto: 'El aeropuerto Alfredo Mendívil está a unos 10 minutos del centro.',
    fotos: { busqueda: 'Ayacucho Peru', wikipedia: 'Ayacucho' },
  },
  tumbes: {
    nombre: 'Tumbes', region: 'Tumbes',
    lema: 'Playas cálidas y manglares',
    descripcion: 'El extremo norte del Perú: mar cálido, manglares y playas como Punta Sal y Zorritos.',
    mejorEpoca: 'De diciembre a abril para playa; el resto del año el mar sigue templado.',
    clima: 'Cálido todo el año.',
    imperdibles: [
      { titulo: 'Punta Sal', texto: 'Playa de aguas tranquilas y cálidas, ideal para descansar.' },
      { titulo: 'Manglares de Tumbes', texto: 'Paseos en bote desde Puerto Pizarro entre cangrejos y aves.' },
      { titulo: 'Zorritos', texto: 'Playas tranquilas y aguas termales cercanas.' },
    ],
    consejos: [
      'Prueba el cebiche de conchas negras, típico de la zona.',
      'Lleva repelente para los manglares.',
    ],
    desdeAeropuerto: 'El aeropuerto Pedro Canga está a unos 15 minutos de la ciudad; a Punta Sal hay más de 1 hora.',
    fotos: { busqueda: 'Punta Sal Peru beach', wikipedia: 'Tumbes' },
  },
  jauja: {
    nombre: 'Jauja', region: 'Junín',
    lema: 'La puerta al Valle del Mantaro',
    descripcion: 'Jauja es la entrada en avión a Huancayo y al Valle del Mantaro: pueblos de artesanos, nevados y lagunas.',
    mejorEpoca: 'De mayo a octubre (temporada seca).',
    clima: 'Días soleados y noches frías.',
    altura: 'Aprox. 3,300 m s. n. m.',
    imperdibles: [
      { titulo: 'Laguna de Paca', texto: 'A minutos de Jauja, con paseos en bote y restaurantes de trucha.' },
      { titulo: 'Nevado Huaytapallana', texto: 'Glaciares y lagunas turquesas cerca de Huancayo.' },
      { titulo: 'Torre Torre', texto: 'Formaciones de roca rojiza sobre Huancayo.' },
      { titulo: 'Feria dominical de Huancayo', texto: 'Artesanía, mates burilados y comida típica.' },
    ],
    consejos: [
      'Prueba la papa a la huancaína en su tierra, y la pachamanca.',
      'Lleva abrigo para las noches.',
    ],
    desdeAeropuerto: 'El aeropuerto Francisco Carlé está en Jauja; a Huancayo hay aproximadamente 1 hora por carretera.',
    fotos: { busqueda: 'Huancayo Peru', wikipedia: 'Jauja' },
  },
  cajamarca: {
    nombre: 'Cajamarca', region: 'Cajamarca',
    lema: 'Historia inca y campiña andina',
    descripcion: 'Aquí se encontraron Atahualpa y Pizarro. Hoy es una ciudad tranquila de casonas, baños termales y los mejores quesos y manjar del país.',
    mejorEpoca: 'De mayo a octubre (seco). En febrero, el Carnaval de Cajamarca es una de las grandes fiestas del Perú.',
    clima: 'Templado de día y fresco de noche; lluvias de diciembre a marzo.',
    altura: '2,750 m s. n. m.',
    imperdibles: [
      { titulo: 'Baños del Inca', texto: 'Aguas termales donde descansaba Atahualpa, a 15 minutos de la ciudad.' },
      { titulo: 'Cuarto del Rescate', texto: 'El único edificio inca que queda en pie en la ciudad.' },
      { titulo: 'Cumbe Mayo', texto: 'Un acueducto preinca tallado en roca y un bosque de piedras.' },
      { titulo: 'Ventanillas de Otuzco', texto: 'Necrópolis preinca excavada en la roca.' },
    ],
    consejos: [
      'Lleva queso, manjar blanco y rosquitas de regreso: son famosos.',
      'Para el Carnaval reserva alojamiento con meses de anticipación.',
    ],
    desdeAeropuerto: 'El aeropuerto Armando Revoredo está a unos 10 minutos del centro.',
    fotos: { busqueda: 'Cajamarca Peru', wikipedia: 'Cajamarca' },
  },
  'puerto maldonado': {
    nombre: 'Puerto Maldonado', region: 'Madre de Dios',
    lema: 'La capital de la biodiversidad',
    descripcion: 'Entrada a la Reserva Nacional Tambopata: selva virgen, lagos, guacamayos y una de las mayores biodiversidades del planeta.',
    mejorEpoca: 'De mayo a octubre (menos lluvia y más fauna visible).',
    clima: 'Cálido y húmedo; en junio y julio puede haber "friajes" de varios días.',
    imperdibles: [
      { titulo: 'Lago Sandoval', texto: 'Nutrias gigantes, aves y caimanes en un lago rodeado de aguajales.' },
      { titulo: 'Collpas de guacamayos', texto: 'Cientos de guacamayos y loros comiendo arcilla al amanecer.' },
      { titulo: 'Albergues en Tambopata', texto: 'Caminatas nocturnas, torres de observación y río.' },
    ],
    consejos: [
      'Consulta con tu médico la vacuna contra la fiebre amarilla.',
      'Lleva repelente, linterna y ropa de manga larga.',
    ],
    desdeAeropuerto: 'El aeropuerto Padre Aldamiz está a unos 15 minutos de la ciudad; muchos albergues incluyen el traslado.',
    fotos: { busqueda: 'Tambopata rainforest', wikipedia: 'Puerto Maldonado' },
  },
  huanuco: {
    nombre: 'Huánuco', region: 'Huánuco',
    lema: 'El mejor clima del mundo',
    descripcion: 'Así la llaman sus vecinos: sol todo el año, valles verdes y uno de los templos más antiguos de América.',
    mejorEpoca: 'Todo el año.',
    clima: 'Templado y soleado casi todo el año.',
    altura: 'Aprox. 1,900 m s. n. m.',
    imperdibles: [
      { titulo: 'Kotosh', texto: 'El Templo de las Manos Cruzadas, de más de 4,000 años.' },
      { titulo: 'Tomaykichwa', texto: 'Pueblo cercano con casonas y la tradición de los Negritos.' },
      { titulo: 'Carpish y Tingo María', texto: 'Hacia la selva, a pocas horas por carretera.' },
    ],
    consejos: ['Prueba la pachamanca huanuqueña y el picante de cuy.'],
    desdeAeropuerto: 'El aeropuerto Alférez Vásquez está a unos 15 minutos de la ciudad.',
    fotos: { busqueda: 'Huanuco Peru', wikipedia: 'Huánuco' },
  },
  andahuaylas: {
    nombre: 'Andahuaylas', region: 'Apurímac',
    lema: 'Lagunas y tradición andina',
    descripcion: 'Una entrada poco conocida a los Andes de Apurímac, con lagunas y restos chancas.',
    mejorEpoca: 'De mayo a octubre.',
    clima: 'Templado de día y frío de noche.',
    imperdibles: [
      { titulo: 'Laguna de Pacucha', texto: 'Paseos y trucha frente a una laguna andina.' },
      { titulo: 'Sóndor', texto: 'Complejo arqueológico chanca con una pirámide escalonada.' },
    ],
    consejos: ['Lleva abrigo y bloqueador.'],
    desdeAeropuerto: 'El aeropuerto está a unos 20 minutos de la ciudad.',
    fotos: { busqueda: 'Apurimac Peru landscape', wikipedia: 'Andahuaylas' },
  },
  chachapoyas: {
    nombre: 'Chachapoyas', region: 'Amazonas',
    lema: 'Kuélap y las cataratas del norte',
    descripcion: 'La tierra de los Chachapoyas, los guerreros de las nubes: fortalezas en la montaña, sarcófagos y una de las cataratas más altas del mundo.',
    mejorEpoca: 'De mayo a octubre.',
    clima: 'Templado y húmedo, con lluvias frecuentes de noviembre a abril.',
    altura: 'Aprox. 2,300 m s. n. m.',
    imperdibles: [
      { titulo: 'Kuélap', texto: 'Una fortaleza amurallada sobre la montaña, más antigua que Machu Picchu.' },
      { titulo: 'Catarata de Gocta', texto: 'Una caminata entre bosques hasta una caída de más de 700 metros.' },
      { titulo: 'Sarcófagos de Karajía', texto: 'Figuras funerarias en lo alto de un acantilado.' },
    ],
    consejos: [
      'Hay pocos vuelos directos: compara también con Jaén.',
      'Lleva calzado de trekking e impermeable.',
    ],
    desdeAeropuerto: 'El aeródromo está cerca de la ciudad; si llegas por Jaén, son unas 4 horas por carretera.',
    fotos: { busqueda: 'Kuelap Peru', wikipedia: 'Chachapoyas' },
  },
  jaen: {
    nombre: 'Jaén', region: 'Cajamarca',
    lema: 'Café y entrada a Amazonas',
    descripcion: 'Tierra de café de altura y la entrada más práctica a Chachapoyas, Kuélap y Gocta.',
    mejorEpoca: 'De mayo a octubre.',
    clima: 'Cálido.',
    imperdibles: [
      { titulo: 'Fincas de café', texto: 'Recorre cafetales y prueba café de origen.' },
      { titulo: 'Ruta a Chachapoyas', texto: 'Kuélap y la catarata de Gocta a unas horas de viaje.' },
    ],
    consejos: ['Si tu destino es Kuélap, organiza el traslado a Chachapoyas con anticipación.'],
    desdeAeropuerto: 'El aeropuerto de Shumba está a unos 30 minutos de la ciudad.',
    fotos: { busqueda: 'Gocta waterfall Peru', wikipedia: 'Jaén (Perú)' },
  },
  talara: {
    nombre: 'Talara', region: 'Piura',
    lema: 'El atajo a Máncora',
    descripcion: 'El aeropuerto más cercano a Máncora, Los Órganos, Lobitos y Cabo Blanco: surf, playas y pesca.',
    mejorEpoca: 'De diciembre a abril para pleno sol; buen clima casi todo el año.',
    clima: 'Cálido y seco.',
    imperdibles: [
      { titulo: 'Máncora', texto: 'Playa, ambiente y atardeceres a poco más de 1 hora.' },
      { titulo: 'Lobitos', texto: 'Uno de los mejores spots de surf del Perú.' },
      { titulo: 'Cabo Blanco', texto: 'Famoso por la pesca deportiva y por Hemingway.' },
    ],
    consejos: ['Coordina el traslado a Máncora antes de llegar; no hay tanto transporte de noche.'],
    desdeAeropuerto: 'El aeropuerto Capitán Montes está en Talara; a Máncora hay aproximadamente 1 hora y 15 minutos.',
    fotos: { busqueda: 'Mancora Peru', wikipedia: 'Máncora' },
  },
  pisco: {
    nombre: 'Pisco', region: 'Ica',
    lema: 'Paracas, Ballestas y desierto',
    descripcion: 'La entrada a la Reserva de Paracas y las Islas Ballestas, con Huacachina y las bodegas de pisco de Ica muy cerca.',
    mejorEpoca: 'Todo el año; de diciembre a marzo hace más calor.',
    clima: 'Seco y soleado, con viento por las tardes.',
    imperdibles: [
      { titulo: 'Islas Ballestas', texto: 'Lobos marinos, pingüinos de Humboldt y miles de aves.' },
      { titulo: 'Reserva Nacional de Paracas', texto: 'Desierto que llega al mar y playas como La Mina.' },
      { titulo: 'Huacachina', texto: 'Un oasis entre dunas para tubulares y sandboard.' },
    ],
    consejos: ['Los tours a Ballestas salen temprano: el mar está más tranquilo en la mañana.'],
    desdeAeropuerto: 'El aeropuerto de Pisco está a unos 20 minutos de Paracas.',
    fotos: { busqueda: 'Paracas Peru', wikipedia: 'Reserva nacional de Paracas' },
  },
  ilo: {
    nombre: 'Ilo', region: 'Moquegua',
    lema: 'Puerto y playas del sur',
    descripcion: 'Un puerto tranquilo del sur con malecón y playas, cerca de Moquegua y sus bodegas.',
    mejorEpoca: 'De diciembre a marzo para playa.',
    clima: 'Templado y seco.',
    imperdibles: [
      { titulo: 'Malecón costero', texto: 'Paseo frente al mar y el muelle Fiscal.' },
      { titulo: 'Moquegua', texto: 'Centro histórico y bodegas de pisco a 1 hora y media.' },
    ],
    consejos: ['Prueba los mariscos frescos del puerto.'],
    desdeAeropuerto: 'El aeropuerto está a unos 10 minutos de la ciudad.',
    fotos: { busqueda: 'Ilo Peru', wikipedia: 'Ilo' },
  },
  huaraz: {
    nombre: 'Huaraz', region: 'Áncash',
    lema: 'La Suiza peruana',
    descripcion: 'La base para explorar la Cordillera Blanca: nevados, lagunas turquesas y algunas de las mejores caminatas de Sudamérica.',
    mejorEpoca: 'De mayo a septiembre (temporada seca, ideal para trekking).',
    clima: 'Días soleados y noches frías.',
    altura: '3,052 m s. n. m.',
    imperdibles: [
      { titulo: 'Laguna 69', texto: 'Una caminata exigente de un día hasta una laguna turquesa al pie del nevado.' },
      { titulo: 'Nevado Pastoruri', texto: 'Glaciar accesible en una caminata corta.' },
      { titulo: 'Chavín de Huántar', texto: 'Templo de más de 3,000 años con galerías subterráneas.' },
    ],
    consejos: [
      'Aclimátate uno o dos días antes de hacer caminatas largas.',
      'Hay pocos vuelos al aeropuerto de Anta: revisa bien horarios.',
    ],
    desdeAeropuerto: 'El aeropuerto está en Anta, a unos 30–40 minutos de Huaraz.',
    fotos: { busqueda: 'Huaraz Peru mountains', wikipedia: 'Huaraz' },
  },
  chimbote: {
    nombre: 'Chimbote', region: 'Áncash',
    lema: 'Bahía y puerta a los Andes',
    descripcion: 'Una ciudad portuaria con bahía, islas cercanas y la ruta del Cañón del Pato hacia el Callejón de Huaylas.',
    mejorEpoca: 'Todo el año.',
    clima: 'Templado y seco.',
    imperdibles: [
      { titulo: 'Isla Blanca', texto: 'Paseos en bote por la bahía.' },
      { titulo: 'Cañón del Pato', texto: 'Una ruta espectacular de túneles hacia Huaraz.' },
    ],
    consejos: ['Prueba el cebiche chimbotano.'],
    desdeAeropuerto: 'El aeropuerto está a unos 15 minutos del centro.',
    fotos: { busqueda: 'Chimbote Peru', wikipedia: 'Chimbote' },
  },
  'tingo maria': {
    nombre: 'Tingo María', region: 'Huánuco',
    lema: 'La Bella Durmiente',
    descripcion: 'Selva alta con un parque nacional, cuevas y cataratas, rodeada de la montaña que parece una mujer dormida.',
    mejorEpoca: 'De mayo a octubre.',
    clima: 'Cálido y húmedo.',
    imperdibles: [
      { titulo: 'Cueva de las Lechuzas', texto: 'Hogar de guácharos y estalactitas, dentro del parque nacional.' },
      { titulo: 'Cataratas', texto: 'Gloria Pata, Santa Carmen y Velo de las Ninfas.' },
    ],
    consejos: ['Lleva repelente y ropa ligera.'],
    desdeAeropuerto: 'El aeropuerto está a pocos minutos de la ciudad.',
    fotos: { busqueda: 'Tingo Maria Peru', wikipedia: 'Tingo María' },
  },
  lima: {
    nombre: 'Lima', region: 'Lima',
    lema: 'La capital gastronómica de América',
    descripcion: 'Centro histórico, malecones sobre el Pacífico y una escena gastronómica entre las mejores del mundo.',
    mejorEpoca: 'De diciembre a abril para sol y playa; el resto del año es nublado pero templado.',
    clima: 'Templado y húmedo; casi nunca llueve.',
    imperdibles: [
      { titulo: 'Centro Histórico', texto: 'Plaza Mayor, catacumbas de San Francisco y casonas coloniales.' },
      { titulo: 'Miraflores y Barranco', texto: 'Malecón, parapente, bares y arte.' },
      { titulo: 'Gastronomía', texto: 'Cebiche, anticuchos y algunos de los mejores restaurantes del mundo.' },
      { titulo: 'Huaca Pucllana', texto: 'Una pirámide preinca en medio de Miraflores.' },
    ],
    consejos: ['El tráfico es intenso: calcula bien los tiempos para ir y volver del aeropuerto.'],
    desdeAeropuerto: 'El aeropuerto Jorge Chávez está en el Callao; a Miraflores hay entre 45 y 75 minutos según el tráfico.',
    fotos: { busqueda: 'Lima Peru Miraflores', wikipedia: 'Lima' },
  },
};

/** Guía para destinos sin contenido propio (sobre todo internacionales). */
function guiaGenerica(nombre: string, internacional: boolean): GuiaDestino {
  return {
    nombre, region: internacional ? 'Internacional' : 'Perú',
    lema: internacional ? `Tu próximo viaje fuera del Perú` : `Descubre ${nombre}`,
    descripcion: `Una tarifa baja para conocer ${nombre}. Revisa las fechas, compara el equipaje incluido y compra antes de que suba el precio.`,
    mejorEpoca: 'Revisa el clima del destino para tus fechas antes de comprar.',
    clima: 'Varía según la temporada.',
    imperdibles: [],
    consejos: internacional
      ? [
          'Verifica que tu pasaporte tenga al menos 6 meses de vigencia desde la fecha de viaje.',
          'Revisa si el destino pide visa a peruanos o algún requisito de ingreso.',
          'Considera un seguro de viaje con cobertura médica.',
          'Si tienes escala, confirma si necesitas visa de tránsito.',
        ]
      : ['Lleva tu DNI vigente.'],
    desdeAeropuerto: 'Revisa las opciones de traslado del aeropuerto antes de llegar.',
    fotos: { busqueda: nombre, wikipedia: nombre },
    generica: true,
  };
}

export function guiaDestino(nombre: string, internacional = false): GuiaDestino {
  return G[normalizarDestino(nombre)] ?? guiaGenerica(nombre, internacional);
}

/** Consejos que aplican a cualquier oferta. */
export const CONSEJOS_COMPRA = [
  'Las tarifas bajas duran poco: si te sirven las fechas, no lo pienses mucho.',
  'Revisa qué equipaje incluye la tarifa; las aerolíneas low cost cobran aparte la maleta.',
  'Compra directamente en la web de la aerolínea o en una agencia confiable desde Google Flights.',
  'Llega al aeropuerto al menos 2 horas antes en vuelos nacionales y 3 horas en internacionales.',
];

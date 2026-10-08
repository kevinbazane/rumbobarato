import type { Oferta } from './tipos.ts';

/** Ofertas de ejemplo para ver la web sin Supabase (modo demo). */
const hace = (horas: number) => new Date(Date.now() - horas * 3600000).toISOString();
const wiki = (url: string, articulo: string) => [
  { url, credito: 'Imagen: Wikimedia Commons', enlace: `https://es.wikipedia.org/wiki/${articulo}` },
];

export const OFERTAS_DEMO: Oferta[] = [
  {
    id: 'demo-1', codigo: 'cja257', clave: 'LIM|CJA|2027-02-01|2027-02-07', alcance: 'nacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'CJA', destino_nombre: 'Cajamarca',
    precio: 257, moneda: 'PEN', fecha_ida: '2027-02-01', fecha_vuelta: '2027-02-07', escalas: 0, aerolinea: 'JetSMART',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: wiki('https://upload.wikimedia.org/wikipedia/commons/c/ca/Plaza_de_cajamarca.jpg', 'Cajamarca'),
    creado_en: hace(2),
  },
  {
    id: 'demo-2', codigo: 'cuz219', clave: 'LIM|CUZ|2026-11-26|2026-12-04', alcance: 'nacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'CUZ', destino_nombre: 'Cusco',
    precio: 219, moneda: 'PEN', fecha_ida: '2026-11-26', fecha_vuelta: '2026-12-04', escalas: 0, aerolinea: 'JetSMART',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: wiki('https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Plaza_de_Cusco_Allison_Bellido.jpg/1920px-Plaza_de_Cusco_Allison_Bellido.jpg', 'Cusco'),
    creado_en: hace(5),
  },
  {
    id: 'demo-3', codigo: 'aqp189', clave: 'LIM|AQP|2026-12-03|2026-12-08', alcance: 'nacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'AQP', destino_nombre: 'Arequipa',
    precio: 189, moneda: 'PEN', fecha_ida: '2026-12-03', fecha_vuelta: '2026-12-08', escalas: 0, aerolinea: 'Sky Airline',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: wiki('https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Catedral_Arequipa%2C_Peru.jpg/1920px-Catedral_Arequipa%2C_Peru.jpg', 'Arequipa'),
    creado_en: hace(20),
  },
  {
    id: 'demo-4', codigo: 'tpp245', clave: 'LIM|TPP|2027-01-14|2027-01-19', alcance: 'nacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'TPP', destino_nombre: 'Tarapoto',
    precio: 245, moneda: 'PEN', fecha_ida: '2027-01-14', fecha_vuelta: '2027-01-19', escalas: 0, aerolinea: 'LATAM',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: wiki('https://upload.wikimedia.org/wikipedia/commons/d/d9/Tarapoto.jpg', 'Tarapoto'),
    creado_en: hace(30),
  },
  {
    id: 'demo-5', codigo: 'jul279', clave: 'LIM|JUL|2027-02-02|2027-02-09', alcance: 'nacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'JUL', destino_nombre: 'Juliaca',
    precio: 279, moneda: 'PEN', fecha_ida: '2027-02-02', fecha_vuelta: '2027-02-09', escalas: 0, aerolinea: 'LATAM',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: wiki('https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Lake_Titicaca_ESA22522896.jpeg/1920px-Lake_Titicaca_ESA22522896.jpeg', 'Lago_Titicaca'),
    creado_en: hace(48),
  },
  {
    id: 'demo-6', codigo: 'tyo4357', clave: 'LIM|NRT|2027-03-10|2027-03-24', alcance: 'internacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'NRT', destino_nombre: 'Tokio',
    precio: 4357, moneda: 'PEN', fecha_ida: '2027-03-10', fecha_vuelta: '2027-03-24', escalas: 1, aerolinea: 'Japan Airlines',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: wiki('https://upload.wikimedia.org/wikipedia/commons/7/7e/Shinjuku_central_park_southwest.jpg', 'Tokio'),
    creado_en: hace(3),
  },
  {
    id: 'demo-7', codigo: 'scl699', clave: 'LIM|SCL|2026-12-10|2026-12-16', alcance: 'internacional',
    origen_codigo: 'LIM', origen_nombre: 'Lima', destino_codigo: 'SCL', destino_nombre: 'Santiago de Chile',
    precio: 699, moneda: 'PEN', fecha_ida: '2026-12-10', fecha_vuelta: '2026-12-16', escalas: 0, aerolinea: 'Sky Airline',
    link_google_flights: 'https://www.google.com/travel/flights',
    imagenes: [], creado_en: hace(10),
  },
];

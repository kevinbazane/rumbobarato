export type Alcance = 'nacional' | 'internacional';

export interface Imagen {
  url: string;
  credito: string;
  enlace?: string;
}

export interface Oferta {
  id: string;
  codigo: string;
  clave: string;
  alcance: Alcance;
  origen_codigo: string | null;
  origen_nombre: string;
  destino_codigo: string | null;
  destino_nombre: string;
  precio: number;
  moneda: string;
  fecha_ida: string; // YYYY-MM-DD
  fecha_vuelta: string; // YYYY-MM-DD
  escalas: number;
  aerolinea: string;
  link_google_flights: string;
  imagenes: Imagen[];
  creado_en: string;
}

/** Oferta internacional vista por alguien sin Premium: sin precio, fechas, aerolínea ni link. */
export type OfertaBloqueada = Pick<Oferta, 'id' | 'codigo' | 'alcance' | 'origen_nombre' | 'destino_nombre' | 'imagenes' | 'creado_en'> & {
  bloqueada: true;
};

export type OfertaVisible = (Oferta & { bloqueada?: false }) | OfertaBloqueada;

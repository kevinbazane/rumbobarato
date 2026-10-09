import 'server-only';
import type { GuiaDestino } from './destinos.ts';
import type { Imagen } from './tipos.ts';

/**
 * Fotos del destino. Con UNSPLASH_ACCESS_KEY usa Unsplash (hasta 4 fotos);
 * si no, la foto principal del artículo de Wikipedia. Se guardan en la oferta
 * al publicarla, así la página no depende de estos servicios al cargar.
 */
export async function buscarImagenes(guia: GuiaDestino): Promise<Imagen[]> {
  const unsplash = await desdeUnsplash(guia.fotos.busqueda).catch(() => []);
  if (unsplash.length) return unsplash;
  return desdeWikipedia(guia.fotos.wikipedia).catch(() => []);
}

async function desdeUnsplash(busqueda: string): Promise<Imagen[]> {
  const clave = process.env.UNSPLASH_ACCESS_KEY;
  if (!clave) return [];
  const url = `https://api.unsplash.com/search/photos?per_page=4&orientation=landscape&content_filter=high&query=${encodeURIComponent(busqueda)}`;
  const r = await fetch(url, { headers: { Authorization: `Client-ID ${clave}` }, cache: 'no-store' });
  if (!r.ok) return [];
  const datos = (await r.json()) as {
    results: { urls: { regular: string }; user: { name: string; links: { html: string } } }[];
  };
  return datos.results.map((f) => ({
    url: f.urls.regular,
    credito: `Foto de ${f.user.name} en Unsplash`,
    enlace: `${f.user.links.html}?utm_source=rumbobarato&utm_medium=referral`,
  }));
}

/** Foto principal del artículo, en tamaño web (máx. 1600 px). */
async function desdeWikipedia(titulo: string): Promise<Imagen[]> {
  for (const idioma of ['es', 'en']) {
    const parametros = new URLSearchParams({
      action: 'query', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '1600',
      format: 'json', redirects: '1', titles: titulo,
    });
    const r = await fetch(`https://${idioma}.wikipedia.org/w/api.php?${parametros}`, {
      headers: { 'User-Agent': 'RumboBarato/1.0 (ofertas de vuelos)' },
      cache: 'no-store',
    });
    if (!r.ok) continue;
    const datos = (await r.json()) as { query?: { pages?: Record<string, { title?: string; thumbnail?: { source: string } }> } };
    const pagina = Object.values(datos.query?.pages ?? {})[0];
    if (pagina?.thumbnail?.source) {
      return [{
        url: pagina.thumbnail.source,
        credito: 'Imagen: Wikimedia Commons',
        enlace: `https://${idioma}.wikipedia.org/wiki/${encodeURIComponent(pagina.title ?? titulo)}`,
      }];
    }
  }
  return [];
}

/**
 * Resumen del destino desde Wikipedia en español (para destinos sin guía escrita).
 * Se guarda en caché una semana para no consultar Wikipedia en cada visita.
 */
export async function resumenWikipedia(titulo: string): Promise<string | null> {
  try {
    const r = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titulo)}`, {
      headers: { 'User-Agent': 'RumboBarato/1.0 (ofertas de vuelos)' },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!r.ok) return null;
    const datos = (await r.json()) as { type?: string; extract?: string };
    if (datos.type !== 'standard' || !datos.extract) return null;
    // Las primeras 3 oraciones bastan para presentar el destino.
    const oraciones = datos.extract.match(/[^.!?]+[.!?]+/g) ?? [datos.extract];
    return oraciones.slice(0, 3).join('').trim();
  } catch {
    return null;
  }
}

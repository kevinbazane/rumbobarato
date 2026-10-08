import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { BannerPlan } from '@/components/BannerPlan';
import { Encabezado } from '@/components/Encabezado';
import { PiePagina } from '@/components/PiePagina';
import { MODO_DEMO, SITIO } from '@/lib/config';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: { default: 'RumboBarato · Vuelos baratos desde Perú', template: '%s · RumboBarato' },
  description: SITIO.descripcion,
  openGraph: { siteName: 'RumboBarato', locale: 'es_PE', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#FF5A36' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={jakarta.variable}>
      <body className="min-h-screen font-sans">
        {MODO_DEMO && (
          <div className="bg-tinta-900 py-1.5 text-center text-xs font-medium text-tinta-200">
            Modo demo: estás viendo ofertas de ejemplo. Configura Supabase para ver las reales.
          </div>
        )}
        <BannerPlan />
        <Encabezado />
        <main>{children}</main>
        <PiePagina />
      </body>
    </html>
  );
}

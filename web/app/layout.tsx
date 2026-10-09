import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { SITIO } from '@/lib/config';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: { default: 'RumboBarato · Vuelos baratos desde Perú', template: '%s · RumboBarato' },
  description: SITIO.descripcion,
  openGraph: { siteName: 'RumboBarato', locale: 'es_PE', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#FF5A36' };

/** Base común. Cada grupo de páginas pone su propio encabezado: (sitio) la web, /unete la landing. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={jakarta.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

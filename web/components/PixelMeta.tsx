'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { META_PIXEL_ID, rastrear } from '@/lib/pixel';

/**
 * Carga el píxel de Meta y registra un PageView en la primera carga y en cada
 * cambio de página (la web navega sin recargar).
 */
export function PixelMeta() {
  const ruta = usePathname();
  const parametros = useSearchParams();
  const primera = useRef(true);

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    // El PageView de la primera carga lo envía el script de abajo.
    if (primera.current) {
      primera.current = false;
      return;
    }
    rastrear('PageView');
  }, [ruta, parametros]);

  if (!META_PIXEL_ID) return null;
  return (
    <Script id="pixel-meta" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID.replace(/[^0-9]/g, '')}');fbq('track','PageView');`}
    </Script>
  );
}

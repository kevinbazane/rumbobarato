import type { Metadata } from 'next';
import Link from 'next/link';
import { EMPRESA } from '@/lib/config';

export const metadata: Metadata = { title: 'Política de privacidad' };

const ACTUALIZADO = '10 de octubre de 2026';

export default function Privacidad() {
  return (
    <article className="contenedor legal max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Política de privacidad</h1>
      <p className="text-sm text-tinta-500">Última actualización: {ACTUALIZADO}</p>

      <p>
        En {EMPRESA.marca} cuidamos tus datos personales conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento. Esta
        política explica qué datos tratamos, para qué y cómo puedes ejercer tus derechos.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        {EMPRESA.razonSocial}, RUC {EMPRESA.ruc}, con domicilio en {EMPRESA.domicilio}. Contacto para temas de datos personales:{' '}
        <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><b>Cuenta:</b> tu correo electrónico y, si ingresas con Google, tu nombre. No usamos contraseñas.</li>
        <li><b>Plan Premium y pagos:</b> fechas de tu plan, monto, medio de pago usado (por ejemplo, Yape o Visa) y el número de la orden. <b>No almacenamos</b> los datos de tu tarjeta ni el código de aprobación de Yape: los procesa directamente Mercado Pago.</li>
        <li><b>Libro de Reclamaciones:</b> nombre, documento de identidad, domicilio, correo, teléfono y el contenido de tu reclamo o queja.</li>
        <li><b>Datos técnicos:</b> cookies necesarias para mantener tu sesión iniciada y registros técnicos del servidor (como la dirección IP) para seguridad y para resolver fallas.</li>
        <li><b>Canal de WhatsApp:</b> al seguir nuestro canal, WhatsApp no nos muestra tu número de teléfono. No recibimos datos personales tuyos por esa vía.</li>
        <li><b>Tu WhatsApp (opcional):</b> solo si nos lo das en tu cuenta. Lo usamos para enviarte promociones <b>únicamente si marcaste la casilla de autorización</b>; registramos la fecha en que la diste.</li>
        <li><b>Píxel de Meta:</b> usamos el píxel de Meta (Facebook e Instagram), que instala cookies para medir las visitas, los clics en “Unirme al canal” y los pagos que provienen de nuestros anuncios, y para mostrar anuncios a personas interesadas. Meta trata esos datos según su propia política de privacidad. Puedes bloquearlo con la configuración de cookies de tu navegador o con las preferencias de anuncios de Facebook e Instagram.</li>
      </ul>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Crear y gestionar tu cuenta y tu plan Premium: activarlo, avisarte del vencimiento y mostrarte tu historial de pagos.</li>
        <li>Procesar tus pagos a través de Mercado Pago y atender devoluciones.</li>
        <li>Registrar y responder tus reclamos y quejas, como exige el Código de Protección y Defensa del Consumidor.</li>
        <li>Mantener la seguridad del sitio y prevenir fraudes.</li>
        <li>Medir el resultado de nuestros anuncios (píxel de Meta).</li>
        <li>Enviarte promociones por WhatsApp, <b>solo con tu consentimiento expreso</b>. Puedes retirarlo en cualquier momento desde Mi cuenta o escribiéndonos.</li>
      </ul>
      <p>
        Tratamos tus datos porque son necesarios para darte el servicio que contratas, para cumplir obligaciones legales (por ejemplo, el Libro de
        Reclamaciones y las normas tributarias) o porque nos das tu consentimiento. <b>No vendemos tus datos.</b>
      </p>

      <h2>4. Con quién los compartimos</h2>
      <p>Solo con proveedores que necesitamos para operar el servicio, que tratan los datos por encargo nuestro:</p>
      <ul>
        <li><b>Mercado Pago</b> (procesamiento de pagos con Yape y tarjetas).</li>
        <li><b>Supabase</b> (base de datos y cuentas de usuario; servidores en Brasil).</li>
        <li><b>Vercel</b> (alojamiento del sitio web; servidores en Estados Unidos y otros países).</li>
        <li><b>Google</b> (solo si eliges ingresar con tu cuenta de Google).</li>
        <li><b>Meta Platforms</b> (píxel de medición de anuncios en Facebook e Instagram).</li>
      </ul>
      <p>
        Algunos de estos proveedores almacenan datos fuera del Perú, lo que constituye un flujo transfronterizo de datos personales. Trabajamos solo
        con proveedores que aplican medidas de seguridad adecuadas. También podemos entregar datos a autoridades cuando una ley o una orden lo exija.
      </p>

      <h2>5. Cuánto tiempo los guardamos</h2>
      <ul>
        <li><b>Cuenta:</b> mientras la mantengas activa o hasta que nos pidas eliminarla.</li>
        <li><b>WhatsApp para promociones:</b> hasta que retires tu consentimiento o nos pidas eliminarlo.</li>
        <li><b>Pagos:</b> durante el plazo que exigen las normas tributarias y contables.</li>
        <li><b>Reclamos y quejas:</b> como mínimo dos (2) años desde su registro, según la normativa de protección al consumidor.</li>
      </ul>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de <b>acceso, rectificación, cancelación y oposición</b> (derechos ARCO), así como revocar tu consentimiento,
        escribiéndonos a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a> con el asunto “Datos personales”. Indica tu nombre, el correo de
        tu cuenta, el derecho que quieres ejercer y adjunta una copia de tu documento de identidad. Te responderemos dentro de los plazos que fija la
        ley.
      </p>
      <p>
        Si consideras que no atendimos tu solicitud, puedes presentar una reclamación ante la Autoridad Nacional de Protección de Datos Personales
        del Ministerio de Justicia y Derechos Humanos.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Usamos conexiones cifradas (https), controles de acceso a la base de datos y proveedores reconocidos. Los pagos se procesan en el entorno
        seguro de Mercado Pago.
      </p>

      <h2>8. Menores de edad</h2>
      <p>
        Nuestro servicio no está dirigido a menores de edad. Si eres menor, necesitas la autorización de tu padre, madre o apoderado para crear una
        cuenta o contratar el plan Premium.
      </p>

      <h2>9. Cambios en esta política</h2>
      <p>Si actualizamos esta política, publicaremos la nueva versión en esta página con su fecha.</p>

      <p>
        Consulta también nuestros <Link href="/terminos">Términos y condiciones</Link> y nuestro{' '}
        <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>.
      </p>
    </article>
  );
}

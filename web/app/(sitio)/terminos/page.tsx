import type { Metadata } from 'next';
import Link from 'next/link';
import { EMPRESA, PLAN, WHATSAPP_CANAL } from '@/lib/config';
import { precio } from '@/lib/formato';

export const metadata: Metadata = { title: 'Términos y condiciones' };

const ACTUALIZADO = '9 de octubre de 2026';

export default function Terminos() {
  return (
    <article className="contenedor legal max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Términos y condiciones</h1>
      <p className="text-sm text-tinta-500">Última actualización: {ACTUALIZADO}</p>

      <h2>1. Quiénes somos</h2>
      <p>
        {EMPRESA.marca} es un servicio de {EMPRESA.razonSocial}, con RUC {EMPRESA.ruc} y domicilio en {EMPRESA.domicilio} (en adelante, “{EMPRESA.marca}”
        o “nosotros”). Puedes escribirnos a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>.
      </p>
      <p>Al usar el sitio web, unirte a nuestro canal de WhatsApp o contratar el plan Premium, aceptas estos términos.</p>

      <h2>2. Qué hace {EMPRESA.marca}</h2>
      <p>
        Detectamos tarifas aéreas que Google Flights marca como de precio bajo y las publicamos como ofertas: vuelos ida y vuelta, directos o con
        máximo una escala. Brindamos un servicio de información y alertas.
      </p>
      <ul>
        <li><b>No vendemos pasajes</b> ni somos agencia de viajes ni aerolínea. La compra la realizas directamente con la aerolínea o la agencia que elijas.</li>
        <li>Los precios, fechas y condiciones provienen de terceros al momento de la detección y <b>pueden cambiar o agotarse sin aviso</b>. No garantizamos que una tarifa siga disponible cuando entres a comprarla.</li>
        <li>Las condiciones del pasaje (equipaje, cambios, devoluciones, requisitos de viaje) son las de la aerolínea o agencia con la que compres.</li>
        <li>Las guías de viaje y los requisitos de ingreso que mostramos son referenciales; confírmalos con la aerolínea o el consulado antes de viajar.</li>
      </ul>

      <h2>3. Plan gratuito</h2>
      <p>
        Las ofertas nacionales en la web y en nuestro <a href={WHATSAPP_CANAL} target="_blank" rel="noopener noreferrer">canal de WhatsApp</a> son gratuitas.
        No garantizamos una cantidad mínima de ofertas: publicamos solo cuando detectamos una tarifa de precio bajo.
      </p>

      <h2>4. Plan Premium</h2>
      <h3>4.1. Qué incluye</h3>
      <ul>
        <li>Acceso en la web a las ofertas internacionales: precio, fechas, aerolínea, escalas y enlace para comprar.</li>
        <li>Acceso a todas las ofertas nacionales, igual que en el plan gratuito.</li>
      </ul>
      <h3>4.2. Precio y duración</h3>
      <ul>
        <li>El plan cuesta <b>S/ {precio(PLAN.precio)}</b> (precio final en soles) y da acceso por <b>{PLAN.dias} días calendario</b> desde la confirmación del pago.</li>
        <li>El pago se procesa a través de Mercado Pago, con Yape o tarjeta. {EMPRESA.marca} no almacena los datos de tu tarjeta.</li>
        <li>El acceso se activa automáticamente cuando Mercado Pago confirma el pago y queda asociado a la cuenta con la que ingresaste.</li>
      </ul>
      <h3>4.3. Sin renovación automática</h3>
      <ul>
        <li><b>El plan no se renueva solo y no realizamos cobros automáticos.</b> Cada periodo de {PLAN.dias} días se paga por separado, solo si tú decides renovarlo.</li>
        <li>Te avisamos en la web {PLAN.diasAvisoAntes} días antes del vencimiento.</li>
        <li>Al vencer el plan, mantienes el acceso durante <b>{PLAN.diasTolerancia} días de tolerancia</b> para que puedas renovar. Pasado ese plazo, el acceso a las ofertas internacionales se bloquea hasta un nuevo pago.</li>
        <li>Si renuevas antes del vencimiento, los nuevos {PLAN.dias} días se suman al final de tu periodo vigente.</li>
      </ul>
      <h3>4.4. Uso personal</h3>
      <p>
        El plan Premium es personal. No está permitido revender, publicar ni redistribuir de forma masiva el contenido exclusivo para miembros
        Premium. Podemos suspender cuentas que incumplan esta regla.
      </p>

      <h2>5. Política de devoluciones</h2>
      <p>Como el plan Premium da acceso inmediato a contenido digital, no se realizan devoluciones por arrepentimiento. Sí devolvemos el importe pagado en estos casos:</p>
      <ol>
        <li><b>Cobro indebido:</b> cobro duplicado, un monto distinto al publicado o un pago confirmado que no activó tu plan y que no pudimos solucionar.</li>
        <li><b>Falla del servicio:</b> una falla técnica atribuible a {EMPRESA.marca} que te impidió acceder al contenido Premium y que no resolvimos en un plazo razonable.</li>
        <li><b>Sin ofertas internacionales:</b> si durante tu periodo pagado de {PLAN.dias} días no publicamos <b>ninguna</b> oferta internacional para miembros Premium.</li>
      </ol>
      <h3>Cómo solicitarla</h3>
      <ul>
        <li>Escríbenos a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a> con el correo de tu cuenta y la fecha del pago, o usa nuestro <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>.</li>
        <li>Puedes pedirla hasta 15 días calendario después de terminado el periodo pagado.</li>
        <li>Revisamos y respondemos en un máximo de 15 días hábiles. Si procede, devolvemos el importe por el mismo medio de pago, a través de Mercado Pago. El tiempo en que el dinero se refleja depende de Mercado Pago y de tu banco o Yape.</li>
        <li>Al aprobarse la devolución, el periodo Premium correspondiente se cancela.</li>
      </ul>

      <h2>6. Cuenta de usuario</h2>
      <p>
        Para contratar Premium debes ingresar con Google o con un enlace enviado a tu correo. Eres responsable del uso de tu cuenta. Si eres menor de
        edad, debes contar con autorización de tu padre, madre o apoderado.
      </p>

      <h2>7. Responsabilidad</h2>
      <p>
        {EMPRESA.marca} actúa con diligencia para publicar información correcta, pero no es responsable por cambios de precio o disponibilidad de
        terceros, ni por las decisiones de compra, condiciones, cancelaciones o reprogramaciones de las aerolíneas o agencias. Esto no limita los
        derechos que te reconoce el Código de Protección y Defensa del Consumidor (Ley N.° 29571).
      </p>

      <h2>8. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos. Publicaremos la nueva versión en esta página con su fecha. Los cambios no afectan los periodos Premium ya
        pagados.
      </p>

      <h2>9. Atención al cliente, reclamos y ley aplicable</h2>
      <p>
        Para consultas escríbenos a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>. Para reclamos o quejas, usa nuestro{' '}
        <Link href="/libro-de-reclamaciones">Libro de Reclamaciones virtual</Link>. Estos términos se rigen por las leyes de la República del Perú.
      </p>
      <p>
        Consulta también nuestra <Link href="/privacidad">Política de privacidad</Link>.
      </p>
    </article>
  );
}

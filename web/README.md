# RumboBarato — Web

Web de ofertas de vuelos con plan Premium (S/ 9.90 por 30 días) pagado con Yape o tarjeta vía Mercado Pago.

**Cómo funciona todo junto**

```
Gmail (alerta Google Flights)
   └─► Apps Script filtra la oferta ─► publica en la web (/api/ofertas) ─► te envía el mensaje con el link de la web
                                                       │
Usuario ─► web (Vercel) ─► Supabase (usuarios, ofertas, pagos)
              └─► Premium: Yape / tarjeta ─► Mercado Pago (API de Orders) ─► webhook ─► activa 30 días
```

- **Nacionales:** gratis y públicas.
- **Internacionales:** solo Premium. Quien no es Premium ve el destino y la foto, pero no el precio, las fechas ni el link.
- **Vencimiento:** un banner avisa 3 días antes. Al vencer quedan 3 días de tolerancia con acceso. Después se bloquean las internacionales y el banner invita a renovar.
- **Renovación anticipada:** los días se suman al final del plan actual.

## Verla en tu Mac (modo demo, sin configurar nada)

```bash
cd web
npm install
npm run dev
```

Abre http://localhost:3000. Sin Supabase, la web muestra ofertas de ejemplo.

---

## Puesta en marcha (una sola vez, unos 60–90 minutos)

Necesitas crear 3 cuentas gratuitas: **Supabase**, **Vercel** y **GitHub**. Además necesitas tu cuenta de **Mercado Pago**.

### 1. Supabase (base de datos y login)

1. Crea una cuenta en https://supabase.com y luego **New project**. Como región elige **South America (São Paulo)**, la más cercana a Perú. Guarda la contraseña de la base de datos.
2. Ve a **SQL Editor → New query**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y haz clic en **Run**.
3. Ve a **Project Settings → API** y copia estos tres valores:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Es secreta: nunca la compartas ni la pegues en Apps Script.
4. **Login con correo:** ya viene activo (Authentication → Providers → Email).
5. **Login con Google.** El botón "Continuar con Google" funciona así: tu web → Google (el usuario elige su cuenta) → Supabase (crea la sesión) → tu web. Para eso hay que conectar Google con Supabase. Ten **dos pestañas abiertas**: Supabase y Google Cloud.

   **a) Copia la dirección de retorno desde Supabase**
   1. En Supabase ve a **Authentication → Sign In / Providers → Google**. Todavía no actives nada.
   2. Abajo aparece **Callback URL (for OAuth)**, algo como `https://abcdwxyzefgh.supabase.co/auth/v1/callback`. La parte `abcdwxyzefgh` es el código de tu proyecto. Cópiala con el botón de copiar.

   **b) Crea el acceso en Google Cloud** (con tu cuenta de Gmail)
   1. Entra a https://console.cloud.google.com. Arriba a la izquierda, en el selector de proyectos, haz clic en **Proyecto nuevo**, ponle `RumboBarato` y créalo. Asegúrate de que quede seleccionado.
   2. Menú ☰ → **APIs y servicios → Pantalla de consentimiento de OAuth** (en algunas cuentas se llama **Google Auth Platform → Branding**). Haz clic en **Comenzar** y llena:
      - Nombre de la app: `RumboBarato`
      - Correo de asistencia: tu correo
      - Público: **Externo**
      - Información de contacto: tu correo
      - Acepta y haz clic en **Crear**.
   3. Ve a **Público** y haz clic en **Publicar app**. ⚠️ Si la dejas en modo "Prueba", solo pueden ingresar los correos que agregues a mano. Como solo pedimos nombre y correo, Google no exige verificación para publicar.
   4. Ve a **Clientes** (o **Credenciales**) → **Crear cliente** (o **Crear credenciales → ID de cliente de OAuth**):
      - Tipo de aplicación: **Aplicación web**
      - Nombre: `RumboBarato web`
      - **URI de redireccionamiento autorizados** → **Agregar URI** → pega la Callback URL que copiaste de Supabase en el paso a). Debe ser exactamente esa, la de `supabase.co`, **no** la de tu web.
      - **Orígenes autorizados de JavaScript:** déjalo vacío.
      - Haz clic en **Crear**.
   5. Aparece una ventana con el **ID de cliente** (termina en `.apps.googleusercontent.com`) y el **Secreto del cliente** (empieza con `GOCSPX-`). Cópialos. Si cierras la ventana, los encuentras de nuevo haciendo clic en el nombre del cliente.

   **c) Pega las claves en Supabase**
   1. De vuelta en Supabase → **Authentication → Sign In / Providers → Google**:
      - Activa **Enable Sign in with Google**.
      - **Client IDs:** pega el ID de cliente.
      - **Client Secret (for OAuth):** pega el secreto.
   2. Haz clic en **Save**.

6. **Indica a Supabase cuál es tu web.** Ve a **Authentication → URL Configuration**. Esto le dice a Supabase a qué direcciones puede devolver al usuario después de ingresar; por seguridad, cualquier otra queda bloqueada.
   - **Site URL:** la dirección principal de tu web. Se usa en los correos de "link para ingresar".
     - Si todavía no publicaste en Vercel (paso 3), pon por ahora `http://localhost:3000` para probar en tu Mac.
     - Cuando Vercel te dé tu dirección, cámbiala por esa, por ejemplo `https://rumbobarato.vercel.app` (sin `/` al final).
   - **Redirect URLs:** haz clic en **Add URL** y agrega estas dos, una por una:
     - `http://localhost:3000/auth/callback` (para probar en tu Mac)
     - `https://TU-WEB/auth/callback`, reemplazando `TU-WEB` por tu dirección real, por ejemplo `https://rumbobarato.vercel.app/auth/callback`
     - Si después compras un dominio, agrega también `https://rumbobarato.com/auth/callback` y actualiza la Site URL.
   - Haz clic en **Save**.

   **No confundas las dos direcciones de retorno:**

   | Dónde se pone | Qué dirección | Para qué |
   |---|---|---|
   | Google Cloud → URI de redireccionamiento | `https://xxxx.supabase.co/auth/v1/callback` | Google devuelve al usuario a **Supabase** |
   | Supabase → Redirect URLs | `https://TU-WEB/auth/callback` | Supabase devuelve al usuario a **tu web** |

   **Si algo falla:**
   - "Error 400: redirect_uri_mismatch": la URI en Google Cloud no es exactamente la Callback URL de Supabase. Revisa que no le falte ni le sobre nada, ni siquiera una `/` al final.
   - Después de elegir la cuenta de Google vuelves al inicio sin sesión, o te lleva a `localhost` estando en la web publicada: falta la dirección de tu web en **Redirect URLs**, o la **Site URL** está mal.
   - "Acceso bloqueado: esta app no completó la verificación" o "solo usuarios de prueba": la app sigue en modo Prueba. Publícala (paso b-3).

### 2. Mercado Pago (Yape y tarjetas)

La web usa la **API de Orders** de Mercado Pago (`/v1/orders`), la más nueva, que reemplaza a la API de Payments. Con ella funcionan los dos medios de pago:
- **Yape:** dentro de la web, con el número y el código de aprobación (Checkout API).
- **Tarjeta:** en la página de pago de Mercado Pago (Checkout Pro).

1. Entra a https://www.mercadopago.com.pe/developers con la cuenta donde quieres recibir el dinero. Ve a **Tus integraciones → Crear aplicación**.
   - Tipo de solución: **Pagos online**, con **plataforma propia** (no Shopify, WooCommerce ni similares).
   - Producto: **Checkout API → API de Orders**. No elijas "API de Payments": Mercado Pago la marca como "será descontinuada pronto".
   - Las credenciales son de la aplicación, no del producto que marques: con las mismas claves funcionan Yape y el pago con tarjeta.
2. En **Credenciales de producción** copia:
   - `Public Key` → `NEXT_PUBLIC_MP_PUBLIC_KEY`
   - `Access Token` → `MP_ACCESS_TOKEN` ⚠️ Es secreto.
3. En **Webhooks → Configurar notificaciones**:
   - **URL de producción:** `https://TU-WEB/api/mercadopago/webhook`
   - **Eventos:** marca **Order (Mercado Pago)**. No marques "Pagos": la web ignora ese evento.
   - Guarda y copia la **clave secreta** → `MP_WEBHOOK_SECRET`.
4. **Yape:** si al probar te sale un error con Yape, confirma con soporte de Mercado Pago que tu cuenta tiene Yape habilitado para Checkout API (Orders).
5. **Para probar sin dinero real:** usa primero las **Credenciales de prueba** y las tarjetas de prueba de Mercado Pago (Tus integraciones → Tarjetas de prueba). Cuando todo funcione, cambia a las de producción.

### 3. Publicar la web en Vercel

1. Crea un repositorio privado en https://github.com y sube la carpeta del proyecto. Si no sabes cómo, pídeme que te guíe.
2. En https://vercel.com, haz clic en **Add New → Project**, elige el repositorio y en **Root Directory** pon `web`.
3. En **Environment Variables** agrega cada variable: **Key** = el nombre (cópialo exacto), **Value** = tu valor. Usa "Add More" para la siguiente.

   | Key | Value | Dónde lo consigues |
   |---|---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://rumbobarato.vercel.app` | El nombre del proyecto en Vercel + `.vercel.app` (sin `/` al final) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Project Settings → API → anon public |
   | `SUPABASE_SERVICE_ROLE_KEY` ⚠️ | `eyJ...` | Supabase → Project Settings → API → service_role |
   | `NEXT_PUBLIC_MP_PUBLIC_KEY` | `APP_USR-...` o `TEST-...` | Mercado Pago → Credenciales → Public Key |
   | `MP_ACCESS_TOKEN` ⚠️ | `APP_USR-...` o `TEST-...` | Mercado Pago → Credenciales → Access Token |
   | `MP_WEBHOOK_SECRET` ⚠️ | letras y números | Mercado Pago → Webhooks → Clave secreta |
   | `OFERTAS_API_SECRET` ⚠️ | 48 caracteres al azar | Créala en la terminal con `openssl rand -hex 24`. Guárdala: va también en Apps Script (`WEB_API_SECRET`) |
   | `UNSPLASH_ACCESS_KEY` | *(opcional)* | unsplash.com/developers |

   ⚠️ = secreta: solo va en Vercel, nunca en el código ni en mensajes.
   - Atajo: en la casilla **Key** puedes pegar varias líneas `NOMBRE=valor` y Vercel las separa solo.
   - Si aún no tienes Supabase o Mercado Pago, puedes hacer **Deploy sin variables**: la web sale en modo demo. Después las agregas en Settings → Environment Variables y haces **Deployments → ⋯ → Redeploy**.
4. Haz clic en **Deploy**. Vercel te da una dirección tipo `https://rumbobarato.vercel.app`.
5. (Opcional) **Dominio propio:** compra `rumbobarato.com` o `.pe` y agrégalo en Vercel → Settings → Domains. Después actualiza `NEXT_PUBLIC_SITE_URL`, la Site URL de Supabase y el webhook de Mercado Pago.

### 4. Conectar Apps Script

En Apps Script, archivo `Config`:

```js
LINK_PREMIUM: 'https://TU-WEB/premium',
WEB_URL: 'https://TU-WEB',
WEB_API_SECRET: 'la-misma-clave-que-OFERTAS_API_SECRET',
```

Pega también el `Main.gs` nuevo. Desde ese momento, cada oferta aprobada se publica en la web y el mensaje lleva el link `https://TU-WEB/o/abc123`.

### 5. Prueba final

1. Entra a tu web, ingresa con Google y paga el Premium con las credenciales de prueba.
2. Debe aparecer "¡Ya eres Premium!" y, en **Mi cuenta**, el plan activo con la fecha de vencimiento.
3. En Supabase → Table Editor → `pagos` debe aparecer el pago, con el número de orden de Mercado Pago (`ORD...`).
4. Para probar el banner de vencimiento, en Supabase → `perfiles` cambia tu `premium_hasta` a ayer y recarga la web.

## Fotos

Por defecto se usan fotos de Wikipedia (gratis). Para fotos de mejor calidad, crea una app gratis en https://unsplash.com/developers y pon su **Access Key** en `UNSPLASH_ACCESS_KEY`.

## Para desarrolladores

- `npm test`: pruebas del estado del plan, la validación de órdenes pagadas y la firma del webhook.
- `npm run typecheck`: revisión de tipos.
- Las guías de cada destino están en `lib/destinos.ts`.

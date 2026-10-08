# RumboBarato — Alertas de Google Flights → mensaje para WhatsApp

Automatización en **Google Apps Script**. Cada 5 minutos revisa tu Gmail. Si llega una alerta de Google Flights con una oferta (nacional o internacional) que cumple todos los filtros, te **envía un correo con el mensaje listo para copiar**. El asunto empieza con **NACIONAL** o **INTERNACIONAL**.

## Qué hace

1. **Disparador:** cada 5 min busca correos de `noreply-travel@google.com`. Cada correo se procesa una sola vez.
2. **Extracción:** de cada opción de vuelo saca origen, destino (con el nombre de la ciudad), precio, fechas de ida y vuelta, escalas ("escalas" y "paradas" cuentan igual), aerolínea, link y etiqueta de precio.
3. **Agrupación:** genera **un solo mensaje por ruta** (ciudad de origen + ciudad de destino; por ejemplo, Tokio-Narita y Tokio-Haneda cuentan como la misma ruta). Si el correo trae varias fechas para la misma ruta, toma **la opción más barata**. Si hay empate de precio, elige la de menos escalas y luego la de fecha de ida más cercana. Si el correo trae rutas distintas, evalúa cada una por separado. Si esa opción tiene 2 o más escalas, la oferta se descarta, aunque haya otras opciones directas más caras.
4. **Filtros (deben cumplirse todos):** etiqueta de precio bajo ("Los precios son bajos", "Precio bajo", "Más barato de lo habitual" o "Más económico de lo habitual"), máximo 1 escala, ida y vuelta, precio en S/.
5. **Mensaje:** las rutas nacionales usan la plantilla 🇵🇪 con la invitación a Premium. Las internacionales usan la plantilla 🌎, sin esa invitación. El link de Google Flights se acorta con TinyURL.
6. **Anti-duplicados:** no repite la misma combinación origen + destino + fechas si ya generó mensaje en las últimas 48 h.
7. **Errores:** si falta algún dato obligatorio, la oferta se descarta con estado `ERROR` y el motivo (por ejemplo: "No se pudo extraer: aerolínea").
8. **Registro:** en un Google Sheet:
   - Hoja **Ofertas:** todas las ofertas detectadas, con estado `MENSAJE GENERADO`, `DESCARTADA`, `DUPLICADA` o `ERROR`, el motivo y el mensaje generado.
   - Hoja **Correos:** cada correo procesado y su resultado.

Para revisar las últimas 10 alertas sin enviar nada, ejecuta `probarAlertasRecientes`.

## Instalación (unos 5 minutos)

1. Entra a <https://script.google.com> con la cuenta de Gmail que recibe las alertas. Haz clic en **Nuevo proyecto** y ponle de nombre `RumboBarato`.
2. Crea tres archivos de script (**+ → Secuencia de comandos**) llamados `Config`, `Parser` y `Main`. Pega en cada uno el contenido de `Config.gs`, `Parser.gs` y `Main.gs`. Borra el `Código.gs` que viene por defecto.
3. En `Config`, reemplaza `LINK_PREMIUM` por tu link real.
4. Ve a **Configuración del proyecto (⚙️)**, marca *Mostrar el archivo de manifiesto "appsscript.json"* y pega el contenido de `appsscript.json`. Esto deja la zona horaria en Lima.
5. Arriba, selecciona la función **`probarUltimaAlerta`** y haz clic en **Ejecutar**. Acepta los permisos de Gmail, Sheets y Drive. En el *Registro de ejecución* verás qué extrajo de tu alerta más reciente. Esta prueba no envía ni registra nada.
6. Si los datos se ven bien, ejecuta **`instalar`**. Esto crea el Sheet de registro (la URL aparece en el registro de ejecución) y activa la revisión automática.

Para detenerlo: ejecuta `desinstalar`.

## Ajustes (`Config.gs`)

| Opción | Para qué sirve |
|---|---|
| `LINK_PREMIUM` | Link que aparece al final del mensaje |
| `CORREO_DESTINO` | A dónde llegan los mensajes listos (vacío = tu propio correo) |
| `HORAS_DEDUPE` | Ventana anti-duplicados (48 h) |
| `MAX_ESCALAS` | Máximo de escalas (1) |
| `MINUTOS_ENTRE_REVISIONES` | Frecuencia de revisión (1, 5, 10, 15 o 30) |
| `AEROPUERTOS_PERU` | Lista de aeropuertos que cuentan como nacionales |
| `AEROLINEAS` | Aerolíneas que se reconocen por nombre |

## Si algo no se extrae bien

Google no publica el formato de sus correos y lo cambia de vez en cuando. Si en la hoja **Ofertas** ves `ERROR` u ofertas descartadas por error:

1. Ejecuta `guardarMuestraEnDrive`. Guarda el HTML de la última alerta en tu Drive.
2. Comparte ese archivo para ajustar el parser. Las pruebas locales están en `pruebas/pruebas.js` (`node pruebas/pruebas.js`).

## Notas

- Apps Script no tiene un disparador instantáneo de Gmail. Por eso revisa cada X minutos (el mínimo es 1).
- Si el link de la alerta pasa por una redirección de Google, se usa el link de Google Flights que va dentro. Si no se puede sacar, se usa el link tal cual (igual abre Google Flights).

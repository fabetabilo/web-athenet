# Newsletter: Turnstile + doble opt-in

Suscripción pública: no hay cuentas ni auth, cualquiera puede suscribir cualquier correo. Por eso el correo queda **pendiente** hasta que su dueño hace clic en el enlace de confirmación; Turnstile protege el endpoint público de bots.

## Flujo

1. El usuario enfoca el input del footer → se carga el script de Turnstile (solo entonces, no en cada página).
2. Al enviar → `turnstile.execute()` genera un token de un solo uso (invisible salvo que Cloudflare pida desafío).
3. `POST /subscriptions` con correo + token → el backend valida el token con Cloudflare y responde `202`. El widget se resetea siempre.
4. El backend envía un correo con `https://<front>/suscripcion/confirmar?token=<token-de-confirmación>`.
5. La página de confirmación hace `POST /subscriptions/confirm` y muestra el resultado.

La confirmación es un `POST` desde la SPA y no un `GET` en el enlace: los escáneres de correo abren links y confirmarían solos.

## Piezas del front

| Archivo | Responsabilidad |
| :--- | :--- |
| [useTurnstile.js](../../src/components/ui/Turnstile/useTurnstile.js) | Carga perezosa del script, render explícito (`execution: 'execute'`, `appearance: 'interaction-only'`), `getToken()` como promesa, `reset()` y limpieza al desmontar. |
| [notificationsApi.js](../../src/service/notificationsApi.js) | `subscribe()` y `confirmSubscription()`. Sin mocks ni fallback. Convierte el status HTTP en `SubscriptionError.kind`. |
| [NewsletterForm.jsx](../../src/components/ui/Newsletter/NewsletterForm.jsx) | Valida formato → token → `subscribe` → mensaje. Estados `idle · loading · ok · error`. |
| [ConfirmSubscription.jsx](../../src/pages/Subscription/ConfirmSubscription.jsx) | Ruta `/suscripcion/confirmar`. Lee `token`, un solo `POST` (guard contra el doble efecto de `StrictMode`). |

## Contrato esperado (ms-notifications)

Llamadas anónimas, JSON. Los paths viven en `NOTIFICATION_ENDPOINTS`.

| Endpoint | Body | Respuesta → `kind` en el front |
| :--- | :--- | :--- |
| `POST /subscriptions` | `{ email, consent: true, turnstileToken }` | `202` ok · `400` `invalid` · `403` `captcha` · `429` `rate` · otro/red `unavailable` |
| `POST /subscriptions/confirm` | `{ token }` | `200` ok · `404` `invalid` · `410` `expired` · otro/red `unavailable` |

Si falla Turnstile en el navegador (bloqueado, desafío vencido), el form muestra el mensaje de `captcha` sin llamar al backend.

## Qué asume del backend

- Valida `turnstileToken` contra `siteverify` con el secret; si Cloudflare no responde, rechaza (`503`).
- `202` con el mismo mensaje exista o no el correo (no revela quién está suscrito).
- `confirm` idempotente: un token ya usado de un suscriptor confirmado responde `200`.
- CORS para el origen de GitHub Pages y `http://localhost:5173` (incluye preflight por `Content-Type: application/json`).

## Configuración y prueba

| Variable | Uso |
| :--- | :--- |
| `VITE_NOTIFICATIONS_API_URL` | Base URL del servicio. Vacía → el form muestra "servicio no disponible". |
| `VITE_TURNSTILE_SITE_KEY` | Site key pública. En producción va como secret del workflow de Pages. |

Claves de prueba de Cloudflare (site key / secret de backend):

| Site key | Comportamiento |
| :--- | :--- |
| `1x00000000000000000000AA` | Siempre pasa |
| `2x00000000000000000000AB` | Siempre falla |
| `3x00000000000000000000FF` | Fuerza el desafío interactivo |

El backend usa `1x0000000000000000000000000000000AA` como secret de prueba (siempre valida). En la prueba real con Gmail, el primer correo suele caer en spam, y el enlace debe apuntar a la URL pública si se abre desde otro dispositivo.

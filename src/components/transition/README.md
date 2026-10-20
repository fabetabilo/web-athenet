# Como implementar pantalla de transición entre secciones

Cortina que cubre la pantalla al navegar entre secciones principales. La URL no
cambia hasta que la cortina termina de cubrir, así que la página nueva monta
detrás y nunca se ve a medio cargar.

## Cuándo aparece

Sólo cuando la navegación cruza de una sección a otra. Las secciones están en
[`src/utils/routeSection.js`](../../utils/routeSection.js):

```
/              Inicio
/events        Eventos
/institutions  Instituciones
```

El match es por prefijo más largo, así que `/events/4` pertenece a `/events`:

| Navegación | Anima |
|---|---|
| `/` → `/events` | sí |
| `/` → `/events/5` | sí |
| `/events` → `/events/4` | no |
| `/events/4` → `/institutions` | sí |

Para agregar una sección nueva basta añadir su entrada a `SECTIONS`. No hay
nada más que tocar.

## Cómo navegar

Usa estos en lugar de `Link`, `NavLink` y `useNavigate`. Si la navegación no
cruza de sección delegan en el comportamiento normal, así que son seguros en
cualquier punto.

Todo se importa de la raíz del módulo, nunca de los archivos de adentro:

```jsx
import { TransitionLink, TransitionNavLink, useTransitionNavigate } from '../transition'

<TransitionLink to="/events">Eventos</TransitionLink>

// NavLink conserva el render-prop isActive
<TransitionNavLink to="/events" className={({ isActive }) => ...}>

// misma firma que useNavigate
const navigate = useTransitionNavigate()
navigate(`/events/${id}`)
```

Prop `transition` para forzar la decisión en un caso puntual:

```jsx
<TransitionLink to="/events/4" transition="always">   // anima aunque no cruce
<TransitionLink to="/events" transition="never">      // nunca anima
navigate('/events/4', { transition: 'always' })
```

Para URLs externas usa `<a>` normal. `Button` acepta `to` para rutas internas
y `href` sólo para externas; `href` renderiza un `<a>` crudo que recarga el
documento e ignora el `basename`.

## Páginas que cargan datos

Si una página hace fetch al montar, puede pedir que la cortina se quede puesta
hasta que llegue la respuesta. Así se revela ya poblada en vez de mostrar su
propio estado de carga:

```jsx
const [isLoading, setIsLoading] = useState(true)
useTransitionHold(isLoading)
```

Es opcional: una página que no lo use funciona igual. Sólo puede alargar la
espera, nunca acortarla, y hay un tope (`--rt-hold-max`) para que un fetch
colgado no deje al usuario atrapado.

Lo usan todas las páginas que cargan datos y son destino de un cruce: `Home`,
`Events`, `Institutions`, `EventDetail` e `InstitutionDetail`.

## Ajustar la animación

Las duraciones viven en
[`RouteTransitionOverlay.module.css`](./RouteTransitionOverlay.module.css) y son
la única fuente de verdad: el JS las lee en runtime.

```css
/* totales de fase: los lee el JS, tienen que ser literales */
--rt-cover: 480ms;      /* la cortina sube hasta cubrir */
--rt-hold-min: 700ms;   /* mínimo cubierto */
--rt-reveal: 760ms;     /* total de la salida */
--rt-hold-max: 2500ms;  /* tope del hold */

/* reparto interno: los solapes evitan el parón entre cortina y logo */
--rt-logo-in: 600ms;
--rt-logo-in-delay: 300ms;      /* el logo entra con la cortina aún subiendo */
--rt-logo-out: 560ms;
--rt-curtain-out-delay: 260ms;  /* la cortina arranca con el logo aún guardándose */
```

Cortina y logo se solapan a propósito en los dos sentidos. Si cambias
`--rt-logo-in` o `--rt-logo-in-delay`, revisa que `--rt-hold-min` siga cubriendo
lo que le queda al logo por correr después del commit.

Si cambias el diseño, respeta lo que dice el comentario de contrato al inicio
de ese archivo. Lo más fácil de romper:

- Esas cinco variables tienen que ser literales, nunca `calc()`. El JS las lee
  con `getComputedStyle`, que no resuelve `calc()` sobre custom properties.
- `.curtain` es el elemento líder: una animación por fase, y es la última en
  terminar. Su `animationend` es lo que avanza la máquina.
- El reposo de `[data-phase='hold']` debe coincidir con el último fotograma de
  la animación de entrada, o se ve un salto al cambiar de fase.
- `.root` nunca puede ser `display: none`.

## Archivos

`index.js` es la superficie pública; lo marcado como interno no se importa
desde afuera del módulo.

| | |
|---|---|
| `index.js` | lo que el módulo exporta |
| `TransitionLink.jsx` | `TransitionLink` y `TransitionNavLink` |
| `useTransitionNavigate.js` | reemplazo de `useNavigate` |
| `useTransitionHold.js` | retención opt-in para páginas que cargan |
| `routeTransitionContext.js` | el contexto y `useRouteTransition` |
| `RouteTransitionProvider.jsx` | máquina de fases, commit de la URL, lock de scroll |
| `RouteTransitionOverlay.jsx` + `.module.css` | *interno* — la cortina, aquí vive todo el diseño |

El provider envuelve la app en [`src/App.jsx`](../../App.jsx) y renderiza la
cortina por su cuenta.

`index.js` tiene que seguir siendo `.js` y no definir componentes: en `.jsx` la
regla `only-export-components` reporta cada hook que se re-exporte al lado de un
componente. Es la misma regla que obliga a que el contexto y los hooks vivan
fuera de `RouteTransitionProvider.jsx`. Tampoco usar `export * from`.

## Comportamiento conocido

- **Atrás/adelante del navegador no animan.** La URL ya cambió cuando React se
  entera, así que no se puede retener. Si la cortina estaba subiendo cuando
  ocurre, se aborta y vuelve a reposo.
- **Con `prefers-reduced-motion` no hay cortina**, sólo navegación directa.
- Un segundo click antes de que la cortina cubra re-apunta el destino sin
  cortar la animación. Después del commit la cortina ya no vuelve a aparecer.

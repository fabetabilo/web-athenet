# Sistema de diseño: tokens y jerarquia

Todos los valores de diseño viven en [variables.css](../../src/styles/variables.css), que se carga en [main.jsx](../../src/main.jsx) antes de `index.css`. 

#### Regla:
Los `.module.css` **no escriben** colores, espaciados ni tamaños a mano: usan tokens. 

> Solo en casos muy especificos, se implementan tokens propios.

## Tres capas

| Capa | Dónde | Ejemplo | Úsala para |
| :--- | :--- | :--- | :--- |
| Primitivos | primer `:root` de `variables.css` | `--color-cyan`, `--space-6`, `--font-weight-bold` | Valores crudos. Escalas. |
| Semánticos | segundo `:root` de `variables.css` | `--text-secondary`, `--color-border`, `--section-pad-lg` | Un rol. Prefiérelos si existe uno que calce. |
| De componente | el propio `.module.css` | `--banner-bg`, `--hero-fade`, `--team-logo-size` | Valores que solo usa ese componente o sus variantes. |

Regla práctica: busca primero un token semántico; si no hay, un primitivo; si el valor solo existe en un componente, declara un token local en ese módulo. No subas a `variables.css` algo que usa un solo componente.

## Escalas

**Espaciado.** `--space-N` = N × 0.25rem (4px). Pasos: `1 2 3 4 5 6 7 8 10 12 14 16 20 24`.

| Token | Valor | Token | Valor |
| :--- | :--- | :--- | :--- |
| `--space-1` | 0.25rem | `--space-8` | 2rem |
| `--space-2` | 0.5rem | `--space-10` | 2.5rem |
| `--space-3` | 0.75rem | `--space-12` | 3rem |
| `--space-4` | 1rem | `--space-16` | 4rem |
| `--space-6` | 1.5rem | `--space-20` | 5rem |

Semánticos de espaciado: `--section-pad-sm/md/lg/xl` (padding vertical de secciones, 2.5 → 5rem), `--card-pad-sm/md/lg` (1 → 2rem), `--grid-gap-sm/md/lg/xl` (0.75 → 2rem).

**Tipografía**, de menor a mayor:

| Grupo | Tokens | Uso |
| :--- | :--- | :--- |
| Texto | `--text-xs` · `sm` · `base` · `md` · `lead` | Labels, metadatos, cuerpo corto (0.7 → 1.125rem). |
| Cuerpo fluido | `--text-body` | Párrafos largos y texto base del `body`. |
| Títulos fijos | `--title-sm` · `md` · `lg` | Títulos de card (1.25 → 1.75rem). |
| Encabezados | `--heading-sm` · `md` | Títulos de sección, fluidos. |
| Display | `--display-xs` → `xl` | Hero, banners, cuenta regresiva. |

Familias: `--font-heading` (títulos), `--font-primary` (cuerpo), `--font-secondary` (navbar y footer), `--font-condensed` (eyebrows de instituciones). Pesos: `--font-weight-regular` → `bold`; 700 es el máximo que cargan las fuentes, no uses 800 ni 900. Interlineado: `--leading-none` (títulos), `--leading-relaxed` (párrafos). Tracking: `--tracking-title` (títulos), `--tracking-wide` (botones, pills), `--tracking-widest` (eyebrows).

**Resto:** radios `--radius-none/sm/md/lg/full`, sombras `--shadow-*`, duraciones `--duration-fast/base/slow`, curva `--ease-out-quart`, capas `--z-*`, íconos `--icon-xs/sm/md/lg`, avatares `--avatar-*`, foco `--focus-ring-width/offset`.

## Recetas

Cómo se arma hoy cada pieza. Copia la receta antes de inventar valores.

**Bloque de texto** (eyebrow → título → párrafo → acción), como en el hero y en EventCountdown:

```css
.eyebrow {
  font-size: var(--text-md);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-cyan);
  margin-bottom: var(--space-3);
}

.title {
  font-family: var(--font-heading);
  font-size: var(--heading-md);
  font-weight: var(--font-heading-weight);
  line-height: var(--leading-none);
  text-transform: uppercase;
  margin-bottom: var(--space-4);
}

.text {
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.action {
  margin-top: var(--space-6);
}
```

| Distancia | Token |
| :--- | :--- |
| Eyebrow → título | `--space-3` |
| Título → párrafo | `--space-4` (títulos display: `--space-6`) |
| Párrafo → botón | `--space-6` a `--space-8` |
| Header de sección → contenido | `--space-8` a `--space-12` |
| Párrafo → párrafo | `--space-6` (global, `p + p`) |

**Sección:** ancho con `width: var(--layout-container); margin-inline: auto;` (o la clase global `.layout-container`), y padding vertical con `--section-pad-*`. Nada de literales de ancho.

**Card y grilla:** padding con `--card-pad-*`, separación entre cards con `--grid-gap-*`.

**Botón de ícono redondo** (flechas del carrusel, redes del footer):

```css
.iconButton {
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--duration-fast) ease;
}

@media (hover: hover) and (pointer: fine) {
  .iconButton:hover {
    border-color: var(--color-cyan);
    color: var(--color-cyan);
  }
}
```

El ícono hereda el color por `currentColor`. No declares `fill` en el `svg`: corta la transición.

**Estados:** hover siempre dentro de `@media (hover: hover) and (pointer: fine)`. Foco con `outline: var(--focus-ring-width) solid <color>`; cyan sobre fondos oscuros, `--color-link` sobre claros.

## Color

| Rol | Sobre fondo oscuro | Sobre fondo claro |
| :--- | :--- | :--- |
| Superficie | `--color-ink`, `--color-navy`, `--surface-page` | `--bg-light`, `--bg-light-alt` |
| Texto | `--text-primary` · `--text-secondary` · `--text-muted` | `--text-dark` · `--text-dark-muted` |
| Borde | `--color-border` · `--color-border-strong` | `--color-border-light` |
| Acento | `--color-cyan` | `--color-link` (azul) · `--color-highlight` (naranja) |

`--color-red` es acento de marca puntual (pills, capa del drawer) y estado de error; no lo uses para hover de links.

Transparencias de un solo uso se escriben en el componente, no como token global:

```css
background: color-mix(in srgb, var(--color-ink) 75%, transparent);
```

## Qué no se tokeniza

- **Breakpoints.** Las variables no funcionan dentro de `@media`. En uso: `600px`, `640px`, `768px`, `1024px`.
- **Valores fuera de escala** que no calzan en `--space-N` (p. ej. `0.35rem`, `0.45rem`): se dejan literales, no se redondean.
- **Valores en `px`** de tamaño fijo (logos, bordes de 1px): pasarlos a `rem` cambia cómo escalan con el zoom del navegador.
- **`z-index` de orden local** (1, 2…) dentro de un componente. Las capas globales sí usan `--z-*`.

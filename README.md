<p align="center">
  <img src="docs/banner.png" alt="banner"> </img>
</p>

Athenet nace con la visión de impulsar el deporte estudiantil y de consolidar la comunidad deportiva a nivel nacional.

Esta plataforma es el punto de encuentro donde el espíritu competitivo y la comunidad convergen, brindando a las distintas casas de estudio el espacio que atletas y sus actividades se merecen.

Más que una cartelera, esta plataforma es una herramienta dinámica diseñada para fomentar el deporte en Chile. A través de Athenet, se gestiona y visibiliza un espectro completo de actividades: desde los torneos y competencias oficiales reguladas directamente por nuestra organización, hasta iniciativas independientes donde las instituciones publican sus propios enfrentamientos, exhibiciones o eventos para atraer al público.

### Stack

<div align="center">

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![CSS](https://img.shields.io/badge/css-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)

</div>

- Node.js (v20 o superior, LTS recomendada)
- [React 19](https://react.dev/) empaquetado con [Vite](https://vitejs.dev/)
- Javascript
- CSS (CSS Modules) encapsulando componentes

### Desarrollo Local

> **Nota:** El proyecto cuenta con un fallback, si no hay una API configurada, el frontend utiliza datos demo (mocks). Revisa la advertencia informativa en la consola del navegador.

Levanta el proyecto en tu entorno local:

1. **Verifica dependencias:**
   ```bash
   node -v
   npm -v
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Copia el archivo de ejemplo para crear tu configuración local:
   ```bash
   cp .env.example .env
   ```

   Variables disponibles en `.env`:
   | Variable | Descripción | Valor por defecto |
   | :--- | :--- | :--- |
   | `VITE_EVENTS_API_URL` | URL base de `ms-events` (Public Controller). Si se omite, se usan mocks. | `http://localhost:8081/api/public` |
   | `VITE_INSTITUTIONS_API_URL` | URL base de `ms-institution` (solo GET públicos). Fuente de instituciones, sedes, equipos y deportes; también resuelve los equipos y el deporte de los eventos reales. Si se omite, se usan mocks. | `https://na279sqez3.execute-api.us-east-1.amazonaws.com/api/v1` |
   | `VITE_COMPETITIONS_API_URL` | URL base de `ms-competitions`. Si se omite, `MatchStrip` usa mocks. | _(vacía)_ |
| `VITE_NOTIFICATIONS_API_URL` | URL base del servicio de suscripciones de `ms-notifications`. Sin mocks: si se omite, el newsletter muestra error. Ver [docs/dev/turnstile.md](docs/dev/turnstile.md). | _(vacía)_ |
| `VITE_TURNSTILE_SITE_KEY` | Site key pública de Cloudflare Turnstile para el newsletter. | `1x00000000000000000000AA` (prueba) |
   | `VITE_USE_EVENT_MOCKS` | Fuerza los mocks de eventos sin llamadas de red (`true` \| `false`). | `false` |
   | `VITE_USE_INSTITUTION_MOCKS` | Fuerza los mocks de instituciones sin llamadas de red (`true` \| `false`). | `false` |
   | `VITE_USE_COMPETITION_MOCKS` | Fuerza los mocks de competencias sin llamadas de red (`true` \| `false`). | `false` |

   > Los eventos reales solo se resuelven con el catálogo real de `ms-institution`, nunca con mocks: si ese servicio no responde, se muestran sin equipos ni deporte.
   >
   > Para apuntar a microservicios locales sin tocar `.env`, crea un `.env.local` (tiene prioridad y está en `.gitignore`).

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

##### Dependencias principales:
- react-router-dom
- react-icons
- axios

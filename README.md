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
   | `VITE_EVENTS_API_URL` | URL base del microservicio `ms-events` (Public Controller). Si se omite, se usan mocks. | `http://localhost:8080/api/public` |
   | `VITE_USE_EVENT_MOCKS` | Forzar el uso de mocks locales ignorando llamadas de red (`true` \| `false`). | `false` |

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

##### Dependencias principales:
- react-router-dom
- lucide-react
- axios

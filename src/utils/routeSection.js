/**
 * Única fuente de verdad sobre qué cuenta como "sección principal" de la web.
 * La pantalla de transición sólo aparece cuando una navegación CRUZA de una
 * sección a otra. Agregar una sección = agregar una línea a SECTIONS.
 */

/** @type {Array<{ id: string, path: string, label: string }>} */
export const SECTIONS = [
  { id: 'home',         path: '/',             label: 'Inicio' },
  { id: 'events',       path: '/events',       label: 'Eventos' },
  { id: 'institutions', path: '/institutions', label: 'Instituciones' },
  // Pendientes de ruta real: rankings, noticias, equipos, competencias, deportes.
  // Mientras sean stubs con to="#" en el navbar no tienen path que registrar.
]

/** Id que se usa cuando un pathname no cae en ninguna sección conocida. */
export const UNKNOWN_SECTION = 'unknown'

/** Deja el pathname en forma canónica: sin query, sin hash y sin slash final. */
function normalizePath(pathname) {
  if (typeof pathname !== 'string' || pathname === '') return '/'
  const clean = pathname.split('?')[0].split('#')[0]
  return clean.replace(/\/+$/, '') || '/'
}

/**
 * Resuelve a qué sección pertenece un pathname, por prefijo más largo.
 * @param {string} pathname - Path SIN basename (el que entrega el router)
 */
export function getSectionId(pathname) {
  const path = normalizePath(pathname)

  let best = null
  for (const section of SECTIONS) {
    // '/' sólo por igualdad: como prefijo se tragaría cualquier ruta. El resto
    // tampoco usa startsWith pelado, o /eventsomething haría match con /events.
    const hit = section.path === '/'
      ? path === '/'
      : path === section.path || path.startsWith(`${section.path}/`)
    if (hit && (!best || section.path.length > best.path.length)) best = section
  }

  return best ? best.id : UNKNOWN_SECTION
}

/** Etiqueta legible de una sección, para anunciarla a lectores de pantalla. */
export function getSectionLabel(pathname) {
  const id = getSectionId(pathname)
  return SECTIONS.find((section) => section.id === id)?.label ?? ''
}

/**
 * Regla única de decisión de la pantalla. Dos rutas desconocidas comparan
 * iguales, así que rutas basura nunca animan entre sí: el default es no animar.
 */
export function crossesSection(fromPathname, toPathname) {
  return getSectionId(fromPathname) !== getSectionId(toPathname)
}

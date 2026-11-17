/**
 * normalizeCompetition
 *
 * Convierte una competencia cruda de ms-competitions en el shape que consume el front.
 *
 * @typedef {Object} NormalizedCompetition
 * @property {number|string} id
 * @property {string} name
 * @property {string|null} competitionImg
 * @property {string|null} status - 'IN_PROGRESS' | 'SCHEDULED' | 'FINISHED'
 * @property {string|null} season - Ej: "2026"
 * @property {boolean} hasDetail false si su pagina aun no muestra nada: la card no es link
 * @property {number} priority orden manual en listados: mayor primero, antes que la fecha (opcional)
 * @property {string|null} description
 * @property {string|null} type - 'CUP' (eliminacion directa) | 'LEAGUE' (todos contra todos)
 * @property {number|null} sportId
 * @property {string|null} sportLabel - Nombre resuelto; null si no se pudo resolver
 * @property {string|null} startDate - ISO "YYYY-MM-DD"
 * @property {string|null} endDate - ISO "YYYY-MM-DD"
 * @property {string} dateLabel - Ej: "1 oct 2026 - 15 nov 2026"
 */

// Date(y, m-1, d) y no new Date(iso): evita el desfase de timezone
function formatShortDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).replace(/\./g, '')
}

function buildDateLabel(startDate, endDate) {
  if (startDate && endDate) return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
  if (startDate) return `Desde ${formatShortDate(startDate)}`
  if (endDate) return `Hasta ${formatShortDate(endDate)}`
  return 'Fechas por definir'
}

/**
 * @param {Object} raw
 * @param {{ resolveSport?: (id: number) => string|null }} [resolvers]
 * @returns {NormalizedCompetition}
 */
export function normalizeCompetition(raw, { resolveSport = () => null } = {}) {
  const startDate = raw.startDate ?? null
  const endDate = raw.endDate ?? null
  const sportId = raw.sportId ?? null
  return {
    id: raw.id,
    name: raw.name,
    competitionImg: raw.competitionImg || null,
    status: raw.status ?? null,
    season: raw.season ?? null,
    priority: raw.priority ?? 0,
    // por defecto solo las copas tienen pagina con contenido (la llave); las ligas aun no
    hasDetail: raw.hasDetail ?? raw.type === 'CUP',
    description: raw.description || null,
    type: raw.type ?? null,
    sportId,
    sportLabel: sportId != null ? resolveSport(sportId) ?? null : null,
    startDate,
    endDate,
    dateLabel: buildDateLabel(startDate, endDate),
  }
}

/** Por prioridad manual y, a igualdad, mas reciente primero (fecha de inicio). @returns {NormalizedCompetition[]} */
export function normalizeCompetitionList(rawList, resolvers) {
  if (!Array.isArray(rawList)) return []
  return rawList
    .map((raw) => normalizeCompetition(raw, resolvers))
    .sort((a, b) => b.priority - a.priority || (b.startDate ?? '').localeCompare(a.startDate ?? ''))
}

/**
 * normalizeCompetition
 *
 * Convierte una competencia cruda de ms-competitions en el shape que consume el front.
 *
 * @typedef {Object} NormalizedCompetition
 * @property {number|string} id
 * @property {string} name
 * @property {string|null} logo
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

/** @returns {NormalizedCompetition} */
export function normalizeCompetition(raw) {
  const startDate = raw.startDate ?? null
  const endDate = raw.endDate ?? null
  return {
    id: raw.id,
    name: raw.name,
    logo: raw.competitionImg || null,
    startDate,
    endDate,
    dateLabel: buildDateLabel(startDate, endDate),
  }
}

/** Mas reciente primero (por fecha de inicio). @returns {NormalizedCompetition[]} */
export function normalizeCompetitionList(rawList) {
  if (!Array.isArray(rawList)) return []
  return rawList
    .map(normalizeCompetition)
    .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''))
}

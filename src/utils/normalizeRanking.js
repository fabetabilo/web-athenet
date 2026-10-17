/**
 * normalizeRanking
 *
 * Convierte la respuesta de ms-ranking (solo ids) en el shape que consume la tabla,
 * resolviendo nombres y logos con el catalogo de equipos e instituciones.
 *
 * @typedef {Object} RankingTeam
 * @property {string|number} id
 * @property {string} name
 * @property {string|null} logo
 *
 * @typedef {Object} RankingInstitution
 * @property {string|number} id
 * @property {string} name
 * @property {string} acronym
 * @property {string|null} logo
 *
 * @typedef {Object} RankingCatalog
 * @property {Map<string, { name: string, logo: string|null }>} teamsById
 * @property {Map<string, RankingInstitution>} institutionsById
 *
 * @typedef {Object} NormalizedLastMatch
 * @property {{ team: RankingTeam, score: number|null }} home
 * @property {{ team: RankingTeam, score: number|null }} away
 * @property {'home'|'away'|null} winner
 * @property {string|null} date
 *
 * @typedef {Object} NormalizedRankingRow
 * @property {string|number} id
 * @property {number} position
 * @property {RankingTeam} team
 * @property {RankingInstitution} institution
 * @property {number} played
 * @property {number} wins
 * @property {number} draws
 * @property {number} losses
 * @property {number} points
 * @property {NormalizedLastMatch|null} lastMatch
 */

/** @returns {RankingInstitution} */
function resolveInstitution(id, catalog) {
  return catalog.institutionsById.get(String(id)) ?? { id, name: '—', acronym: '—', logo: null }
}

/** @returns {RankingTeam} */
function resolveTeam(id, institutionId, catalog) {
  const team = catalog.teamsById.get(String(id))
  const institution = catalog.institutionsById.get(String(institutionId))
  return {
    id,
    name: team?.name ?? `Equipo ${id}`,
    logo: team?.logo ?? institution?.logo ?? null,
  }
}

/** @returns {NormalizedLastMatch|null} */
function normalizeLastMatch(raw, catalog) {
  if (!raw) return null

  const homeScore = raw.puntajeLocal ?? null
  const awayScore = raw.puntajeVisita ?? null
  let winner = null
  if (homeScore !== null && awayScore !== null && homeScore !== awayScore) {
    winner = homeScore > awayScore ? 'home' : 'away'
  }

  return {
    home: { team: resolveTeam(raw.equipoLocalId, raw.institucionLocalId, catalog), score: homeScore },
    away: { team: resolveTeam(raw.equipoVisitaId, raw.institucionVisitaId, catalog), score: awayScore },
    winner,
    date: raw.fecha ?? null,
  }
}

/** @returns {NormalizedRankingRow} */
export function normalizeRankingRow(raw, catalog) {
  return {
    id: raw.equipoId,
    position: raw.posicion,
    team: resolveTeam(raw.equipoId, raw.institucionId, catalog),
    institution: resolveInstitution(raw.institucionId, catalog),
    played: raw.pj,
    wins: raw.pg,
    draws: raw.pe,
    losses: raw.pp,
    points: raw.pts,
    lastMatch: normalizeLastMatch(raw.ultimoEncuentro, catalog),
  }
}

/** @returns {NormalizedRankingRow[]} */
export function normalizeRanking(rawList, catalog) {
  if (!Array.isArray(rawList)) return []
  return rawList
    .map((raw) => normalizeRankingRow(raw, catalog))
    .sort((a, b) => a.position - b.position)
}

/**
 * Fecha mas reciente entre los ultimos partidos del ranking (ISO "YYYY-MM-DD"), o null.
 * @param {NormalizedRankingRow[]} rows
 */
export function getLastUpdate(rows) {
  const dates = rows.map((row) => row.lastMatch?.date?.slice(0, 10)).filter(Boolean)
  return dates.length ? dates.reduce((latest, date) => (date > latest ? date : latest)) : null
}

/** "2026-10-12" -> "12/10/2026" */
export function formatNumericDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}


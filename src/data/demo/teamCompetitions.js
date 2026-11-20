/**
 * Mock de las competencias de un equipo (CompetitionResponse de ms-competitions).
 * Sale de competitions.js: los equipos de futbol juegan la copa vigente y entre 2 y 4
 * historicas segun su id. Todas las competencias demo son de futbol, asi que los equipos
 * de basquetbol no tienen ninguna.
 */
import { competitions } from './competitions'
import { FOOTBALL_TEAMS } from './teams'

const [current, ...historical] = competitions

/** @param {number|string} teamId */
export function getMockTeamCompetitions(teamId) {
  if (!(teamId in FOOTBALL_TEAMS)) return []

  const seed = Number(teamId) || 0
  const count = 2 + (seed % 3)
  return [current, ...Array.from({ length: count }, (_, i) => historical[(seed + i) % historical.length])]
}

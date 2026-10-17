/**
 * Mock de las competencias de un equipo (CompetitionResponse de ms-competitions).
 * El pool es compartido: cada equipo toma 5 segun su id, para que varien entre filas.
 */

const POOL = [
  { id: 1, name: 'Copa Primavera', startDate: '2026-10-01', endDate: '2026-11-15' },
  { id: 2, name: 'Liga Interuniversitaria', startDate: '2026-08-10', endDate: '2026-12-05' },
  { id: 3, name: 'Copa Invierno', startDate: '2026-06-01', endDate: '2026-07-20' },
  { id: 4, name: 'Torneo Apertura', startDate: '2026-03-15', endDate: '2026-05-30' },
  { id: 5, name: 'Copa Athenet', startDate: '2025-11-02', endDate: '2025-12-14' },
  { id: 6, name: 'Torneo de Verano', startDate: '2026-01-10', endDate: '2026-02-21' },
  { id: 7, name: 'Liga Clausura', startDate: '2025-08-18', endDate: '2025-11-30' },
]

/** @param {number|string} teamId */
export function getMockTeamCompetitions(teamId) {
  const offset = Number(teamId) % POOL.length || 0
  return Array.from({ length: 5 }, (_, i) => POOL[(offset + i) % POOL.length])
    .map((competition) => ({ ...competition, competitionImg: null }))
}

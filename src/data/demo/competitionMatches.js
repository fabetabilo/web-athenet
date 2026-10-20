/**
 * Mock de la llave de una copa: 15 partidos de octavos a final.
 *
 * Shape crudo alineado con GET /api/public/competitions/{id}/fixture temporalmente.
 * Los lados traen sigla y escudo inline para que el fallback se vea bien sin
 * ms-institution; normalizeMatch prefiere el crudo sobre el resolver.
 */
import { resolveInstitution } from './institutionDirectory'

const COMPETITION = {
  id: 1,
  name: 'Copa Instituciones de Chile 2026',
  season: '2026',
  sportId: 5,
  competitionImg: null,
}

/** Lado del marcador. score null hasta que el delegado carga el resultado. */
const side = (institutionId, teamId, score = null) => {
  const { acronym, image } = resolveInstitution(institutionId)
  return {
    teamId,
    institutionId,
    name: `${acronym} Fútbol`,
    acronym,
    logoUrl: image,
    score,
  }
}

/** home y away en null son los que la ronda anterior todavia no define. */
const match = (id, round, position, date, time, status, home = null, away = null) => ({
  id,
  competition: COMPETITION,
  round,
  position,
  date,
  time,
  location: 'Santiago, Chile',
  address: 'Av. España 8',
  status,
  home,
  away,
})

export const competitionMatches = [
  // --- Octavos jugados ---
  match(1, 'ROUND_OF_16', 1, '2026-10-11', '15:00', 'FINISHED', side(1, 201, 3), side(4, 202, 1)),
  match(2, 'ROUND_OF_16', 2, '2026-10-11', '19:30', 'FINISHED', side(6, 203, 2), side(8, 204, 1)),
  match(3, 'ROUND_OF_16', 3, '2026-10-12', '11:00', 'FINISHED', side(2, 205, 3), side(5, 206, 0)),
  match(4, 'ROUND_OF_16', 4, '2026-10-12', '16:00', 'FINISHED', side(3, 207, 1), side(7, 208, 2)),

  // --- Octavos por jugar ---
  match(5, 'ROUND_OF_16', 5, '2026-10-20', '11:00', 'SCHEDULED', side(8, 209), side(1, 210)),
  match(6, 'ROUND_OF_16', 6, '2026-10-20', '16:00', 'SCHEDULED', side(7, 211), side(2, 212)),
  match(7, 'ROUND_OF_16', 7, '2026-10-21', '11:00', 'SCHEDULED', side(4, 213), side(6, 214)),
  match(8, 'ROUND_OF_16', 8, '2026-10-21', '16:00', 'SCHEDULED', side(5, 215), side(3, 216)),

  // --- Cuartos: el primero ya tiene al ganador de octavos 1, falta su rival ---
  match(9, 'QUARTER_FINAL', 1, '2026-10-27', '16:00', 'SCHEDULED', side(1, 201)),
  match(10, 'QUARTER_FINAL', 2, '2026-10-27', '19:00', 'SCHEDULED'),
  match(11, 'QUARTER_FINAL', 3, '2026-10-28', '16:00', 'SCHEDULED'),
  match(12, 'QUARTER_FINAL', 4, '2026-10-28', '19:00', 'SCHEDULED'),

  // --- Semifinales y final ---
  match(13, 'SEMI_FINAL', 1, '2026-11-04', '16:00', 'SCHEDULED'),
  match(14, 'SEMI_FINAL', 2, '2026-11-04', '19:00', 'SCHEDULED'),
  match(15, 'FINAL', 1, '2026-11-11', '18:00', 'SCHEDULED'),
]

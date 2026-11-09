/**
 * Mock de la llave de la copa vigente: 15 partidos de octavos a final.
 *
 * Shape crudo alineado con GET /api/public/competitions/current/fixture. Los lados traen
 * sigla y escudo inline para verse bien sin ms-institution; normalizeMatch prefiere el crudo.
 * Fechas relativas a hoy: siempre hay resultados jugados, un partido hoy, uno manana y la
 * final por definir. El estado se deriva de la hora; los marcadores son fijos.
 */
import { parseLocalDateTime } from '../../utils/dateTime'
import { daysFromToday } from './demoDates'
import { DEMO_TEAMS, resolveTeam } from './teams'

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000

const COMPETITION = {
  id: 1,
  name: 'Copa Instituciones de Chile 2026',
  season: String(new Date().getFullYear()),
  sportId: 1,
  competitionImg: `${import.meta.env.BASE_URL}img/c-inst2026.png`,
}

const side = (teamId, score) => {
  const { name, acronym, logo } = resolveTeam(teamId)
  return {
    teamId,
    institutionId: DEMO_TEAMS[teamId].institutionId,
    name,
    acronym,
    logoUrl: logo,
    score,
  }
}

const statusAt = (date, time) => {
  const start = parseLocalDateTime(`${date}T${time}`).getTime()
  if (Date.now() < start) return 'SCHEDULED'
  return Date.now() < start + MATCH_DURATION_MS ? 'IN_PROGRESS' : 'FINISHED'
}

/** home/away como [teamId, marcador]; null mientras la ronda anterior no lo define. */
const match = (id, round, position, days, time, home = null, away = null) => {
  const date = daysFromToday(days)
  const status = statusAt(date, time)
  const toSide = (entry) => entry && side(entry[0], status === 'FINISHED' ? entry[1] : null)
  return {
    id,
    competition: COMPETITION,
    round,
    position,
    date,
    time,
    location: 'Santiago, Chile',
    address: 'Av. España 8',
    status,
    home: toSide(home),
    away: toSide(away),
  }
}

export const competitionMatches = [
  match(1, 'ROUND_OF_16', 1, -12, '11:00', [101, 3], [110, 1]),
  match(2, 'ROUND_OF_16', 2, -12, '15:00', [102, 2], [111, 0]),
  match(3, 'ROUND_OF_16', 3, -12, '17:00', [103, 2], [112, 1]),
  match(4, 'ROUND_OF_16', 4, -12, '19:30', [104, 2], [113, 1]),
  match(5, 'ROUND_OF_16', 5, -11, '11:00', [105, 1], [114, 0]),
  match(6, 'ROUND_OF_16', 6, -11, '15:00', [106, 3], [115, 2]),
  match(7, 'ROUND_OF_16', 7, -11, '17:00', [107, 1], [116, 0]),
  match(8, 'ROUND_OF_16', 8, -11, '19:30', [108, 2], [109, 3]),

  match(9, 'QUARTER_FINAL', 1, -4, '16:00', [101, 2], [102, 1]),
  match(10, 'QUARTER_FINAL', 2, -4, '19:00', [103, 0], [104, 2]),
  match(11, 'QUARTER_FINAL', 3, -3, '16:00', [105, 1], [106, 3]),
  match(12, 'QUARTER_FINAL', 4, -3, '19:00', [107, 2], [109, 1]),

  match(13, 'SEMI_FINAL', 1, 0, '19:00', [101, 2], [104, 0]),
  match(14, 'SEMI_FINAL', 2, 1, '19:00', [106], [107]),
  match(15, 'FINAL', 1, 4, '18:00'),
]

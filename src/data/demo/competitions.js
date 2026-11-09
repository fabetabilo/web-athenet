/**
 * Mock de GET /competitions (CompetitionResponse de ms-competitions).
 * La copa vigente comparte id y nombre con competitionMatches.js.
 */
import { daysFromToday } from './demoDates'

const BASE_URL = import.meta.env.BASE_URL
const SEASON = String(new Date().getFullYear())

const base = { sportId: 1, season: SEASON, winPoints: 3, drawPoints: 1, lossPoints: 0 }

export const competitions = [
  {
    ...base,
    id: 1,
    name: 'Copa Instituciones de Chile',
    description: 'El torneo nacional que reúne a las instituciones de educación superior de todo el país. Formato de eliminación directa desde octavos de final hasta la gran final.',
    type: 'CUP',
    status: 'IN_PROGRESS',
    competitionImg: `${BASE_URL}img/c-inst2026.png`,
    startDate: daysFromToday(-30),
    endDate: daysFromToday(14),
  },
  {
    ...base,
    id: 2,
    name: 'Liga Interuniversitaria',
    description: 'Liga regular de todos contra todos a lo largo de la temporada. El campeón se define por puntos acumulados.',
    sportId: 2,
    type: 'LEAGUE',
    status: 'IN_PROGRESS',
    competitionImg: `${BASE_URL}img/c-inter2026.png`,
    startDate: daysFromToday(-60),
    endDate: daysFromToday(30),
  },
  {
    ...base,
    id: 3,
    name: 'Copa Invierno 2026',
    description: 'Copa de mitad de temporada disputada en sedes bajo techo durante el receso de invierno.',
    sportId: 3,
    type: 'CUP',
    status: 'FINISHED',
    competitionImg: `${BASE_URL}img/c-inv2026.png`,
    startDate: daysFromToday(-150),
    endDate: daysFromToday(-110),
  },
  {
    ...base,
    id: 4,
    name: 'Torneo Apertura',
    description: 'Torneo que abre el calendario deportivo universitario y define los cupos para la copa nacional.',
    sportId: 10,
    type: 'LEAGUE',
    status: 'FINISHED',
    competitionImg: `${BASE_URL}img/c-toaper2025.png`,
    startDate: daysFromToday(-230),
    endDate: daysFromToday(-170),
  },
  {
    ...base,
    id: 5,
    name: 'Torneo Fútbol de Verano 2025',
    description: 'Torneo corto de pretemporada jugado en enero, pensado para que los equipos lleguen rodados al año competitivo.',
    type: 'CUP',
    status: 'FINISHED',
    competitionImg: `${BASE_URL}img/c-tofuve2025.png`,
    startDate: daysFromToday(-300),
    endDate: daysFromToday(-260),
  },
]

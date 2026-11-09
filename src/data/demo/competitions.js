/**
 * Mock de GET /competitions (CompetitionResponse de ms-competitions).
 * La copa vigente comparte id y nombre con competitionMatches.js.
 */
import { daysFromToday } from './demoDates'

const BASE_URL = import.meta.env.BASE_URL
const SEASON = String(new Date().getFullYear())

const base = { sportId: 1, season: SEASON, description: '', winPoints: 3, drawPoints: 1, lossPoints: 0 }

export const competitions = [
  {
    ...base,
    id: 1,
    name: 'Copa Instituciones de Chile',
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
    type: 'CUP',
    status: 'FINISHED',
    competitionImg: `${BASE_URL}img/c-tofuve2025.png`,
    startDate: daysFromToday(-300),
    endDate: daysFromToday(-260),
  },
]

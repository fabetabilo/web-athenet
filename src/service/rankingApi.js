import { normalizeRanking } from '../utils/normalizeRanking'
import { createApiClient } from './apiClient'
import { getInstitutionsById, getSportsById, getTeamsById } from './institutionsApi'
import { MOCK_RANKING_BY_SPORT, MOCK_RANKING_TEAMS } from '../data/demo/rankingHistorico'
import { institutions as institutionsMock } from '../data/demo/institutions'
import { MOCK_SPORTS } from '../data/demo/sports'

/**
 * @file rankingApi.js
 * Servicio de lectura para ms-ranking (GET publicos) con mocks locales para el modo demo.
 *
 * ms-ranking solo entrega ids: nombres y logos se resuelven con el catalogo de
 * ms-institution. En modo mock, ranking y catalogo pasan juntos a mock.
 */

const { mockMode, mockModeReason, request, warn } = createApiClient({
  service: 'rankingApi',
  baseUrl: import.meta.env.VITE_RANKING_API_URL || '',
  urlVar: 'VITE_RANKING_API_URL',
  timeout: 7000,
})

export const RANKING_ENDPOINTS = {
  HISTORIC: (sportId) => `/deportes/${sportId}/ranking-historico`,
}

/** Deportes con ranking en la web; `names` son los nombres posibles en el catalogo. */
export const RANKING_SPORTS = [
  { key: 'futbol', names: ['futbol', 'futbol sala', 'futsal'] },
  { key: 'basquetbol', names: ['basquetbol', 'basquet', 'baloncesto'] },
]

function warnMocks(reason) {
  warn(`Usando datos locales: ${reason}`)
}

const simplify = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

function buildMockCatalog() {
  const institutionsById = new Map(institutionsMock.map((institution) => [String(institution.id), {
    id: institution.id,
    name: institution.name,
    acronym: institution.acronym,
    logo: institution.image,
  }]))

  const teamsById = new Map(Object.entries(MOCK_RANKING_TEAMS).map(([id, team]) => [id, {
    name: team.name,
    logo: team.logo ?? institutionsById.get(String(team.institutionId))?.logo ?? null,
  }]))

  const sportsById = new Map(Object.entries(MOCK_SPORTS).map(([id, name]) => [id, name]))

  return { teamsById, institutionsById, sportsById }
}

async function getCatalog() {
  if (mockMode) return buildMockCatalog()

  const [teamsById, institutionsById, sportsById] = await Promise.all([
    getTeamsById(),
    getInstitutionsById(),
    getSportsById(),
  ])
  return { teamsById, institutionsById, sportsById }
}

/**
 * Deportes con ranking disponibles, con el id que usa el catalogo.
 * @returns {Promise<Array<{ id: string, key: string, label: string }>>}
 */
export async function getRankingSports() {
  if (mockMode) warnMocks(mockModeReason)
  const { sportsById } = await getCatalog()

  // La etiqueta es el nombre real del catalogo (p. ej. "Fútbol Sala").
  return RANKING_SPORTS.flatMap(({ key, names }) => {
    const entry = [...sportsById].find(([, name]) => names.includes(simplify(name)))
    return entry ? [{ id: entry[0], key, label: entry[1] }] : []
  })
}

/**
 * Ranking historico de un deporte, ordenado por posicion.
 * @param {{ id: string, key: string }} sport
 * @returns {Promise<import('../utils/normalizeRanking').NormalizedRankingRow[]>}
 */
export async function getRankingHistorico(sport) {
  const { data } = await request(
    RANKING_ENDPOINTS.HISTORIC(sport.id),
    MOCK_RANKING_BY_SPORT[sport.key] ?? []
  )

  return normalizeRanking(data, await getCatalog())
}

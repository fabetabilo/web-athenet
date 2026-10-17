import axios from 'axios'
import { normalizeRanking } from '../utils/normalizeRanking'
import { getInstitutionsById, getSportsById, getTeamsById } from './institutionsApi'
import { MOCK_RANKING_BY_SPORT, MOCK_RANKING_TEAMS } from '../data/demo/rankingHistorico'
import { institutions as institutionsMock } from '../data/demo/institutions'
import { MOCK_SPORTS } from '../data/demo/sports'

/**
 * @file rankingApi.js
 * Servicio de lectura para ms-ranking (GET publicos) con fallback a mocks locales.
 *
 * ms-ranking solo entrega ids: nombres y logos se resuelven con el catalogo de
 * ms-institution. Si ranking cae o no hay URL, ranking y catalogo pasan juntos a mock.
 */

const BASE_URL = import.meta.env.VITE_RANKING_API_URL || ''
const FORCED_MOCK = import.meta.env.VITE_USE_RANKING_MOCKS === 'true'
const IS_MOCK_MODE = FORCED_MOCK || !BASE_URL

const rankingClient = axios.create({
  baseURL: BASE_URL,
  timeout: 7000,
  headers: { Accept: 'application/json' },
})

export const RANKING_ENDPOINTS = {
  HISTORIC: (sportId) => `/deportes/${sportId}/ranking-historico`,
}

/** Deportes con ranking en la web; `names` son los nombres posibles en el catalogo. */
export const RANKING_SPORTS = [
  { key: 'futbol', label: 'Fútbol', names: ['futbol'] },
  { key: 'basquetbol', label: 'Básquetbol', names: ['basquetbol', 'basquet', 'baloncesto'] },
]

function warnFallback(reason) {
  if (import.meta.env.DEV) {
    console.warn(`[rankingApi] Usando datos locales: ${reason}`)
  }
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

async function getCatalog(useMock) {
  if (!useMock) {
    try {
      const [teamsById, institutionsById, sportsById] = await Promise.all([
        getTeamsById(),
        getInstitutionsById(),
        getSportsById(),
      ])
      return { teamsById, institutionsById, sportsById }
    } catch (error) {
      warnFallback(error.message)
    }
  }
  return buildMockCatalog()
}

/**
 * Deportes con ranking disponibles, con el id que usa el catalogo.
 * @returns {Promise<Array<{ id: string, key: string, label: string }>>}
 */
export async function getRankingSports() {
  const { sportsById } = await getCatalog(IS_MOCK_MODE)

  return RANKING_SPORTS.flatMap(({ key, label, names }) => {
    const entry = [...sportsById].find(([, name]) => names.includes(simplify(name)))
    return entry ? [{ id: entry[0], key, label }] : []
  })
}

/**
 * Ranking historico de un deporte, ordenado por posicion.
 * @param {{ id: string, key: string }} sport
 * @returns {Promise<import('../utils/normalizeRanking').NormalizedRankingRow[]>}
 */
export async function getRankingHistorico(sport) {
  let raw
  let useMock = IS_MOCK_MODE

  if (!useMock) {
    try {
      const response = await rankingClient.get(RANKING_ENDPOINTS.HISTORIC(sport.id))
      raw = response.data
    } catch (error) {
      warnFallback(error.message)
      useMock = true
    }
  }

  if (useMock) raw = MOCK_RANKING_BY_SPORT[sport.key] ?? []

  return normalizeRanking(raw, await getCatalog(useMock))
}

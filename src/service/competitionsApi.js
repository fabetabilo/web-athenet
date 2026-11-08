import { normalizeMatch } from '../utils/normalizeMatch'
import { normalizeCompetitionList } from '../utils/normalizeCompetition'
import { createApiClient } from './apiClient'
import { getInstitutionsById } from './institutionsApi'
import { getMockTeamCompetitions } from '../data/demo/teamCompetitions'
import { competitionMatches as competitionMatchesMock } from '../data/demo/competitionMatches'
/**
 * @file competitionsApi.js
 * Servicio de consumo para ms-competitions con mocks locales para el modo demo.
 *
 * Reglas:
 * 1. Solo hay mocks sin URL configurada o en modo demo; con URL, un fallo se propaga.
 * 2. Todo resultado pasa obligatoriamente por normalizeMatch antes del render.
 *
 * Este servicio tambien compone: ms-competitions manda el id de institucion y
 * ms-institution la sigla y el escudo. Es la union que hara un BFF publico, y
 * el dia que exista se cae sola (normalizeMatch ya prefiere lo que trae el crudo).
*/


// --- Configuracion de cliente Axios ------------------------------------------------
const { request, warn } = createApiClient({
    service: 'competitionsApi',
    baseUrl: import.meta.env.VITE_COMPETITIONS_API_URL || '',
    urlVar: 'VITE_COMPETITIONS_API_URL',
    timeout: 5000,
})

export const COMPETITION_ENDPOINTS = {
    COMPETITIONS: '/competitions',
    COMPETITION_FIXTURE: (id) => `/competitions/${id}/fixture`,
    CURRENT_FIXTURE: '/competitions/current/fixture',
}


/**
 * Ejecuta una peticion HTTP contra ms-competitions con normalizacion obligatoria.
 *
 * @template TRaw, TNorm
 * @param {string} endpoint - Path relativo del recurso
 * @param {TRaw} mockData - Dataset mock crudo, usado solo en modo mock
 * @param {(raw: TRaw) => TNorm} normalizer - Funcion de normalizacion
 * @param {import('axios').AxiosRequestConfig} [config] - Configuracion adicional de Axios
 * @returns {Promise<TNorm>}
 */
async function requestAndNormalize(endpoint, mockData, normalizer, config = {}) {
    const { data } = await request(endpoint, mockData, config)
    return normalizer(data)
}

/** Institucion que no se pudo resolver: el marcador queda con la sigla neutra. */
const NO_INSTITUTION = { acronym: '—', image: null }

/**
 * Resuelve sigla y escudo por id de institucion contra ms-institution.
 *
 * getInstitutionsById rechaza si ese servicio no responde, y el Promise.all del
 * Home no tiene catch: sin este try un fallo dejaria colgada la transicion de ruta.
 *
 * @returns {Promise<(id: number) => { acronym: string, image: string|null }>}
 */
async function loadInstitutionResolver() {
    try {
        const institutionsById = await getInstitutionsById()
        return (id) => {
            const found = institutionsById.get(String(id))
            return found ? { acronym: found.acronym, image: found.logo } : NO_INSTITUTION
        }
    } catch (error) {
        warn(`Sin siglas de ms-institution: ${error.message}`)
        return () => NO_INSTITUTION
    }
}

/** Normalizador de lista con el resolver ya cargado. */
const normalizeList = (rawList, resolve) =>
    Array.isArray(rawList) ? rawList.map((m) => normalizeMatch(m, resolve)) : []


// --- Funciones del Servicio -----------------------------------------------------
/**
 * Todos los partidos de la competencia vigente, de octavos a final y en orden de cuadro.
 * Las rondas que la llave todavia no define llegan con los lados vacios.
 *
 * Cual es la competencia vigente lo decide el backend: la que esta en curso o, si no hay
 * ninguna, la ultima que termino. Por eso aqui no entra ningun id.
 *
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeMatch').NormalizedMatch[]>}
 */
export async function getCurrentCompetitionMatches(config = {}) {
    const resolve = await loadInstitutionResolver()

    return requestAndNormalize(
        COMPETITION_ENDPOINTS.CURRENT_FIXTURE,
        competitionMatchesMock,
        (rawList) => normalizeList(rawList, resolve),
        config
    )
}

export const TEAM_COMPETITIONS_LIMIT = 5

/**
 * Ultimas competencias en las que participo un equipo, mas reciente primero.
 *
 * @param {number|string} teamId
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeCompetition').NormalizedCompetition[]>}
 */
export async function getTeamCompetitions(teamId, config = {}) {
    return requestAndNormalize(
        COMPETITION_ENDPOINTS.COMPETITIONS,
        getMockTeamCompetitions(teamId),
        normalizeCompetitionList,
        { ...config, params: { teamId, limit: TEAM_COMPETITIONS_LIMIT } }
    )
}

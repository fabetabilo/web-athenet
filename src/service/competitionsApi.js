import axios from 'axios'
import { normalizeMatch } from '../utils/normalizeMatch'
import { normalizeCompetitionList } from '../utils/normalizeCompetition'
import { getInstitutionsById } from './institutionsApi'
import { getMockTeamCompetitions } from '../data/demo/teamCompetitions'
import { competitionMatches as competitionMatchesMock } from '../data/demo/competitionMatches'
/**
 * @file competitionsApi.js
 * Servicio de consumo para ms-competitions con fallback a mocks locales.
 *
 * Mismas reglas que eventsApi.js:
 * 1. El fallback se activa ante fallos de red, status no-ok o ausencia de URL.
 * 2. Todo resultado pasa obligatoriamente por normalizeMatch antes del render.
 *
 * Este servicio tambien compone: ms-competitions manda el id de institucion y
 * ms-institution la sigla y el escudo. Es la union que hara un BFF publico, y
 * el dia que exista se cae sola (normalizeMatch ya prefiere lo que trae el crudo).
 */


// --- Configuracion de cliente Axios ------------------------------------------------
const BASE_URL = import.meta.env.VITE_COMPETITIONS_API_URL || ''
const FORCED_MOCK = import.meta.env.VITE_USE_COMPETITION_MOCKS === 'true'

const competitionsClient = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        Accept: 'application/json',
    },
})

// endpoints de api competencias
export const COMPETITION_ENDPOINTS = {
    COMPETITIONS: '/competitions',
    COMPETITION_FIXTURE: (id) => `/competitions/${id}/fixture`,
}


/**
 * Ejecuta una peticion HTTP contra ms-competitions con fallback reactivo
 * y normalizacion obligatoria.
 *
 * @template TRaw, TNorm
 * @param {string} endpoint - Path relativo del recurso
 * @param {TRaw} fallbackData - Dataset mock crudo en caso de fallo
 * @param {(raw: TRaw) => TNorm} normalizer - Funcion de normalizacion
 * @param {import('axios').AxiosRequestConfig} [config] - Configuracion adicional de Axios
 * @returns {Promise<TNorm>}
 */
async function requestWithFallback(endpoint, fallbackData, normalizer, config = {}) {
    const hasBaseUrl = Boolean(BASE_URL)

    // bypass preventivo si se fuerza mock o si no existe URL configurada en el entorno
    if (FORCED_MOCK || !hasBaseUrl) {
        if (import.meta.env.DEV) {
            console.warn(
                `[competitionsApi] Usando mock fallback para "${endpoint}" (${FORCED_MOCK ? 'VITE_USE_COMPETITION_MOCKS=true' : 'VITE_COMPETITIONS_API_URL no definida'
                })`
            )
        }
        return normalizer(fallbackData)
    }

    // --- Intento de llamada HTTP con Axios ------------
    try {
        const response = await competitionsClient.get(endpoint, config)
        return normalizer(response.data)
    } catch (error) {
        // en caso de error de red o status no ok se activa el fallback
        if (import.meta.env.DEV) {
            const reason = error.response
                ? `HTTP ${error.response.status} (${error.response.statusText || 'Error de servidor'})`
                : error.code === 'ECONNABORTED'
                    ? 'Timeout de conexión (5000ms)'
                    : error.message || 'Error de red'
            console.warn(`[competitionsApi] Fallback mock activado para "${endpoint}". Motivo: ${reason}`)
        }
        return normalizer(fallbackData)
    }
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
        if (import.meta.env.DEV) {
            console.warn(`[competitionsApi] Sin siglas de ms-institution: ${error.message}`)
        }
        return () => NO_INSTITUTION
    }
}

/** Normalizador de lista con el resolver ya cargado. */
const normalizeList = (rawList, resolve) =>
    Array.isArray(rawList) ? rawList.map((m) => normalizeMatch(m, resolve)) : []


// --- Funciones del Servicio -----------------------------------------------------
/**
 * Todos los partidos de una competencia, de octavos a final y en orden de cuadro.
 * Las rondas que la llave todavia no define llegan con los lados vacios.
 *
 * @param {number} id - id de la competencia
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeMatch').NormalizedMatch[]>}
 */
export async function getCompetitionMatches(id, config = {}) {
    const fallbackRaw = competitionMatchesMock.filter((m) => m.competition.id === id)
    const resolve = await loadInstitutionResolver()

    return requestWithFallback(
        COMPETITION_ENDPOINTS.COMPETITION_FIXTURE(id),
        fallbackRaw,
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
    return requestWithFallback(
        COMPETITION_ENDPOINTS.COMPETITIONS,
        getMockTeamCompetitions(teamId),
        normalizeCompetitionList,
        { ...config, params: { teamId, limit: TEAM_COMPETITIONS_LIMIT } }
    )
}

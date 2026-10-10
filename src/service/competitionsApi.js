import axios from 'axios'
import { normalizeMatch, sortForStrip } from '../utils/normalizeMatch'
import { competitionMatches as competitionMatchesMock } from '../data/demo/competitionMatches'
import { resolveInstitution } from '../data/demo/institutionDirectory'
/**
 * @file competitionsApi.js
 * Servicio de consumo para ms-competitions con fallback a mocks locales.
 *
 * Mismas reglas que eventsApi.js:
 * 1. El fallback se activa ante fallos de red, status no-ok o ausencia de URL.
 * 2. Todo resultado pasa obligatoriamente por normalizeMatch antes del render.
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
    LATEST_RESULTS: '/competitions/results/latest',
    COMPETITION_MATCHES: (id) => `/competitions/${id}/matches`,
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

/**
 * Normalizador de lista compartido por los endpoints de coleccion.
 * Inyecta el diccionario local: el dia que ms-competitions mande sigla y escudo,
 * se borra el segundo argumento y normalizeMatch sigue correcto.
 */
const normalizeList = (rawList) =>
    Array.isArray(rawList) ? rawList.map((m) => normalizeMatch(m, resolveInstitution)) : []


// --- Funciones del Servicio -----------------------------------------------------
/**
 * Obtiene los ultimos resultados para la barra de marcadores del home.
 *
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeMatch').NormalizedMatch[]>}
 */
export async function getLatestResults(config = {}) {
    return requestWithFallback(
        COMPETITION_ENDPOINTS.LATEST_RESULTS,
        competitionMatchesMock,
        (rawList) => sortForStrip(normalizeList(rawList)),
        config
    )
}

/**
 * Obtiene todos los encuentros de una competencia, de 16avos a final.
 *
 * @param {number} id - id de la competencia
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeMatch').NormalizedMatch[]>}
 */
export async function getCompetitionMatches(id, config = {}) {
    const fallbackRaw = competitionMatchesMock.filter((m) => m.competitionId === id)

    return requestWithFallback(
        COMPETITION_ENDPOINTS.COMPETITION_MATCHES(id),
        fallbackRaw,
        normalizeList,
        config
    )
}

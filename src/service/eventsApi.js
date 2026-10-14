import axios from 'axios'
import { normalizeEvent } from '../utils/normalizeEvent'
import { getTeamsById, getSportsById } from './institutionsApi'
import { nextEvents as nextEventsMock } from '../data/demo/eventsNext'
import { nextEvent as nextEventMock } from '../data/demo/eventFeatured'
import { allEvents as allEventsMock } from '../data/demo/eventsAll'
import { resolveTeam as resolveMockTeam } from '../data/demo/teams'
import { resolveSport as resolveMockSport } from '../data/demo/sports'
/**
 * @file eventsApi.js
 * Servicio de consumo para ms-events con fallback a mocks locales en caso de no haber llamada a apis reales
 *
 * 1. el Fallback se activa UNICAMENTE ante fallos de red o respuestas HTTP con status no-ok.
 * 2. Todo resultado (real o fallback) pasa obligatoriamente por normalizeEvent antes de entregarse al render
 * 3. Los DTOs entre endpoints pueden diferir por diseño; el servicio y el normalizador
 *    son tolerantes a la presencia/ausencia de campos opcionales.
 *
 * Decision (sin BFF): ms-events solo guarda IDs de equipos y deporte. Este servicio es el
 * unico punto que los cruza con ms-institution, la fuente de verdad. Eventos reales se resuelven
 * solo con el catalogo real y eventos mock solo con los diccionarios demo: sus IDs no son comparables.
 */


// --- Configuracion de cliente Axios ------------------------------------------------
const BASE_URL = import.meta.env.VITE_EVENTS_API_URL || ''
const FORCED_MOCK = import.meta.env.VITE_USE_EVENT_MOCKS === 'true'

const eventsClient = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        Accept: 'application/json',
    },
})

// endpoints de api eventos
export const EVENT_ENDPOINTS = {
    NEXT_EVENTS: '/events/next',
    NEXT_EVENT: '/events/featured',
    ALL_EVENTS: '/events',
    EVENT_BY_ID: (id) => `/events/${id}`,
}



/**
 * Ejecuta una petición HTTP con Axios contra api-events con fallback reactivo.
 *
 * Decision temporal: <---------------!!!!
 * Esto porque el dia que se quiera levantar el frontend por si solo por X razon, el frontend se encarga de mostrar
 * datos y todo lo necesario para ser una demo.
 *
 * @template TRaw
 * @param {string} endpoint - Path relativo del recurso
 * @param {TRaw} fallbackData - Dataset mock crudo en caso de fallo
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional de Axios
 * @returns {Promise<{ data: TRaw, source: 'api' | 'mock' }>}
 */
async function fetchWithFallback(endpoint, fallbackData, config = {}) {
    // bypass preventivo si se fuerza mock o si no existe URL configurada en el entorno
    if (FORCED_MOCK || !BASE_URL) {
        if (import.meta.env.DEV) {
            console.warn(
                `[eventsApi] Usando mock fallback para "${endpoint}" (${FORCED_MOCK ? 'VITE_USE_EVENT_MOCKS=true' : 'VITE_EVENTS_API_URL no definida'
                })`
            )
        }
        return { data: fallbackData, source: 'mock' }
    }

    // --- Intento de llamada HTTP con Axios ------------
    try {
        const response = await eventsClient.get(endpoint, config)
        return { data: response.data, source: 'api' }
    } catch (error) {
        // en caso  de error de red o status no ok se activa el fallback
        if (import.meta.env.DEV) {
            const reason = error.response
                ? `HTTP ${error.response.status} (${error.response.statusText || 'Error de servidor'})`
                : error.code === 'ECONNABORTED'
                    ? 'Timeout de conexión (5000ms)'
                    : error.message || 'Error de red'
            console.warn(`[eventsApi] Fallback mock activado para "${endpoint}". Motivo: ${reason}`)
        }
        return { data: fallbackData, source: 'mock' }
    }
}


const MOCK_RESOLVERS = { resolveTeam: resolveMockTeam, resolveSport: resolveMockSport }

/**
 * Resolvers de equipos y deporte segun el origen de los eventos.
 * Si ms-institution no responde, los eventos reales quedan sin resolver (nunca con mocks).
 */
async function getResolvers(source) {
    if (source === 'mock') return MOCK_RESOLVERS

    try {
        const [teamsById, sportsById] = await Promise.all([getTeamsById(), getSportsById()])
        return {
            resolveTeam: (id) => teamsById.get(String(id)),
            resolveSport: (id) => sportsById.get(String(id)),
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn(`[eventsApi] Equipos y deportes sin resolver: ${error.message}`)
        }
        return {}
    }
}

/**
 * Pide el recurso, elige los resolvers segun su origen y entrega el resultado normalizado.
 *
 * @template TRaw, TNorm
 * @param {string} endpoint
 * @param {TRaw} fallbackData
 * @param {(raw: TRaw, normalize: (rawEvent: Object) => import('../utils/normalizeEvent').NormalizedEvent) => TNorm} toResult
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<TNorm>}
 */
async function requestEvents(endpoint, fallbackData, toResult, config) {
    const { data, source } = await fetchWithFallback(endpoint, fallbackData, config)
    const resolvers = await getResolvers(source)
    return toResult(data, (rawEvent) => normalizeEvent(rawEvent, resolvers))
}

const toList = (rawList, normalize) => (Array.isArray(rawList) ? rawList.map(normalize) : [])
const toSingle = (rawObj, normalize) => (rawObj ? normalize(rawObj) : null)


// --- Funciones del Servicio -----------------------------------------------------
/**
 * Obtiene la lista de los proximos eventos (segun regla de Api).
 *
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent[]>}
 */
export async function getNextEvents(config = {}) {
    return requestEvents(EVENT_ENDPOINTS.NEXT_EVENTS, nextEventsMock, toList, config)
}

/**
 * Obtiene el evento destacado individual para la seccion de countdown / hero.
 * (el que queremos mostrar con contador)
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent | null>}
 */
export async function getNextEvent(config = {}) {
    return requestEvents(EVENT_ENDPOINTS.NEXT_EVENT, nextEventMock, toSingle, config)
}

/**
 * Obtiene el dataset completo de eventos para la vista de exploración.
 * El backend filtra server-side; el frontend no aplica filtros extra.
 *
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent[]>}
 */
export async function getAllEvents(config = {}) {
    return requestEvents(EVENT_ENDPOINTS.ALL_EVENTS, allEventsMock, toList, config)
}

/**
 * Obtiene el detalle de un evento por su internalId.
 * Si falla la API real, busca en el mock general (allEventsMock) para fallback.
 *
 * @param {string} id - internalId del evento
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent | null>}
 */
export async function getEventById(id, config = {}) {
    const fallbackRaw = allEventsMock.find((e) => e.internalId === id) ?? null
    return requestEvents(EVENT_ENDPOINTS.EVENT_BY_ID(id), fallbackRaw, toSingle, config)
}

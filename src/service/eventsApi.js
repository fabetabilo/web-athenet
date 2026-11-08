import { normalizeEvent } from '../utils/normalizeEvent'
import { createApiClient } from './apiClient'
import { getTeamsById, getSportsById } from './institutionsApi'
import { nextEvents as nextEventsMock } from '../data/demo/eventsNext'
import { nextEvent as nextEventMock } from '../data/demo/eventFeatured'
import { allEvents as allEventsMock, notFinishedEvents as notFinishedEventsMock } from '../data/demo/eventsAll'
import { resolveTeam as resolveMockTeam } from '../data/demo/teams'
import { resolveSport as resolveMockSport } from '../data/demo/sports'
/**
 * @file eventsApi.js
 * Servicio de consumo para ms-events con mocks locales para el modo demo
 *
 * 1. Solo hay mocks sin URL configurada o en modo demo; con URL, un fallo se propaga a la vista.
 * 2. Todo resultado (real o mock) pasa obligatoriamente por normalizeEvent antes de entregarse al render
 * 3. Los DTOs entre endpoints pueden diferir por diseño; el servicio y el normalizador
 *    son tolerantes a la presencia/ausencia de campos opcionales.
 *
 * Decision (sin BFF): ms-events solo guarda IDs de equipos y deporte. Este servicio es el
 * unico punto que los cruza con ms-institution, la fuente de verdad. Eventos reales se resuelven
 * solo con el catalogo real y eventos mock solo con los diccionarios demo: sus IDs no son comparables.
 */


// --- Configuracion de cliente Axios ------------------------------------------------
const { request, warn } = createApiClient({
    service: 'eventsApi',
    baseUrl: import.meta.env.VITE_EVENTS_API_URL || '',
    urlVar: 'VITE_EVENTS_API_URL',
    timeout: 5000,
})

// endpoints de api eventos
export const EVENT_ENDPOINTS = {
    NEXT_EVENTS: '/events/next',
    NEXT_EVENT: '/events/featured',
    ALL_EVENTS: '/events/all-next',
    EVENT_BY_ID: (id) => `/events/${id}`,
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
        warn(`Equipos y deportes sin resolver: ${error.message}`)
        return {}
    }
}

/**
 * Pide el recurso, elige los resolvers segun su origen y entrega el resultado normalizado.
 *
 * @template TRaw, TNorm
 * @param {string} endpoint
 * @param {TRaw} mockData
 * @param {(raw: TRaw, normalize: (rawEvent: Object) => import('../utils/normalizeEvent').NormalizedEvent) => TNorm} toResult
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<TNorm>}
 */
async function requestEvents(endpoint, mockData, toResult, config) {
    const { data, source } = await request(endpoint, mockData, config)
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
    return requestEvents(EVENT_ENDPOINTS.ALL_EVENTS, notFinishedEventsMock, toList, config)
}

/**
 * Obtiene el detalle de un evento por su internalId.
 * En modo mock lo busca en el mock general (allEventsMock).
 *
 * @param {string} id - internalId del evento
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent | null>}
 */
export async function getEventById(id, config = {}) {
    const mockRaw = allEventsMock.find((e) => e.internalId === id) ?? null
    return requestEvents(EVENT_ENDPOINTS.EVENT_BY_ID(id), mockRaw, toSingle, config)
}

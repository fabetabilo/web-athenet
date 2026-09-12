import axios from 'axios'
import { normalizeEvent } from '../utils/normalizeEvent'
import { nextEvents as nextEventsMock } from '../data/nextEvents'
import { nextEvent as nextEventMock } from '../data/nextEvent'
import { allEvents as allEventsMock } from '../data/allEvents'
/**
 * @file eventsApi.js
 * Servicio de consumo para ms-events con fallback a mocks locales en caso de no haber llamada a apis reales
 *
 * 1. el Fallback se activa UNICAMENTE ante fallos de red o respuestas HTTP con status no-ok.
 * 2. Todo resultado (real o fallback) pasa obligatoriamente por normalizeEvent antes de entregarse al render
 * 3. Los DTOs entre endpoints pueden diferir por diseño; el servicio y el normalizador
 *    son tolerantes a la presencia/ausencia de campos opcionales.
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
 * Ejecuta una petición HTTP con Axios contra api-events con fallback reactivo y normalización obligatoria
 * 
 * Decision temporal: <---------------!!!!
 * Esto porque el dia que se quiera levantar el frontend por si solo por X razon, el frontend se encarga de mostrar
 * datos y todo lo necesario para ser una demo.
 * 
 *
 * @template TRaw, TNorm
 * @param {string} endpoint - Path relativo del recurso
 * @param {TRaw} fallbackData - Dataset mock crudo en caso de fallo
 * @param {(raw: TRaw) => TNorm} normalizer - Función de normalización
 * @param {import('axios').AxiosRequestConfig} [config] - Configuración adicional de Axios
 * @returns {Promise<TNorm>}
 */
async function requestWithFallback(endpoint, fallbackData, normalizer, config = {}) {
    const hasBaseUrl = Boolean(BASE_URL)

    // bypass preventivo si se fuerza mock o si no existe URL configurada en el entorno
    if (FORCED_MOCK || !hasBaseUrl) {
        if (import.meta.env.DEV) {
            console.warn(
                `[eventsApi] Usando mock fallback para "${endpoint}" (${FORCED_MOCK ? 'VITE_USE_EVENT_MOCKS=true' : 'VITE_EVENTS_API_URL no definida'
                })`
            )
        }
        return normalizer(fallbackData)
    }

    // --- Intento de llamada HTTP con Axios ------------
    try {
        const response = await eventsClient.get(endpoint, config)
        return normalizer(response.data)
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
        return normalizer(fallbackData)
    }
}


// --- Funciones del Servicio -----------------------------------------------------
/**
 * Obtiene la lista de los proximos eventos (segun regla de Api).
 *
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent[]>}
 */
export async function getNextEvents(config = {}) {
    return requestWithFallback(
        EVENT_ENDPOINTS.NEXT_EVENTS,
        nextEventsMock,
        (rawList) => (Array.isArray(rawList) ? rawList.map(normalizeEvent) : []),
        config
    )
}

/**
 * Obtiene el evento destacado individual para la seccion de countdown / hero.
 * (el que queremos mostrar con contador)
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent | null>}
 */
export async function getNextEvent(config = {}) {
    return requestWithFallback(
        EVENT_ENDPOINTS.NEXT_EVENT,
        nextEventMock,
        (rawObj) => (rawObj ? normalizeEvent(rawObj) : null),
        config
    )
}

/**
 * Obtiene el dataset completo de eventos para la vista de exploración.
 * El backend filtra server-side; el frontend no aplica filtros extra.
 *
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<import('../utils/normalizeEvent').NormalizedEvent[]>}
 */
export async function getAllEvents(config = {}) {
    return requestWithFallback(
        EVENT_ENDPOINTS.ALL_EVENTS,
        allEventsMock,
        (rawList) => (Array.isArray(rawList) ? rawList.map(normalizeEvent) : []),
        config
    )
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

    return requestWithFallback(
        EVENT_ENDPOINTS.EVENT_BY_ID(id),
        fallbackRaw,
        (rawObj) => (rawObj ? normalizeEvent(rawObj) : null),
        config
    )
}

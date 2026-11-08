import axios from 'axios'

/**
 * @file apiClient.js
 * Cliente HTTP compartido por los servicios con modo demo.
 *
 * 1. Modo demo (`VITE_USE_DEMO_MOCKS=true`): ningun servicio sale a la red, todos entregan sus mocks.
 * 2. Sin modo demo, un servicio sin URL configurada usa solo sus mocks; los demas siguen consumiendo su API.
 * 3. Con URL configurada NO hay mocks: un fallo se reporta y se propaga para que la vista no
 *    muestre datos inventados ni confunda "no hay datos" con "la API no responde".
 *
 * El modo mock se avisa solo en desarrollo; un fallo de red se reporta siempre.
 */

const DEMO_MOCKS = import.meta.env.VITE_USE_DEMO_MOCKS === 'true'

/**
 * Traduce un fallo de Axios al motivo que se muestra en consola.
 *
 * @param {import('axios').AxiosError} error
 * @param {number} timeout
 * @returns {string}
 */
function describeError(error, timeout) {
    if (error.response) {
        return `HTTP ${error.response.status} (${error.response.statusText || 'Error de servidor'})`
    }
    if (error.code === 'ECONNABORTED') return `Timeout de conexión (${timeout}ms)`
    return error.message || 'Error de red'
}

/**
 * Crea el cliente Axios de un servicio junto con su modo mock.
 *
 * @param {Object} options
 * @param {string} options.service - Nombre del servicio para el prefijo de los avisos
 * @param {string} options.baseUrl - URL base del microservicio (vacia si no esta configurada)
 * @param {string} options.urlVar - Nombre de la variable de entorno
 * @param {number} options.timeout - Timeout en milisegundos
 */
export function createApiClient({ service, baseUrl, urlVar, timeout }) {
    const client = axios.create({
        baseURL: baseUrl,
        timeout,
        headers: { Accept: 'application/json' },
    })

    const mockMode = DEMO_MOCKS || !baseUrl
    const mockModeReason = DEMO_MOCKS ? 'VITE_USE_DEMO_MOCKS=true' : `${urlVar} no definida`

    const warn = (message) => {
        if (import.meta.env.DEV) console.warn(`[${service}] ${message}`)
    }

    const logNetworkError = (endpoint, error) => {
        if (import.meta.env.DEV) {
            console.error(`[${service}] Error de red en "${endpoint}": ${describeError(error, timeout)}`)
        } else {
            console.error(`[${service}] Error de red`)
        }
    }

    /**
     * Pide el recurso y entrega el crudo junto con su origen. Mock solo si no hay API configurada
     *
     * @template TRaw
     * @param {string} endpoint - Path relativo del recurso
     * @param {TRaw} mockData - Dataset mock crudo, usado solo en modo mock
     * @param {import('axios').AxiosRequestConfig} [config]
     * @returns {Promise<{ data: TRaw, source: 'api' | 'mock' }>}
     */
    async function request(endpoint, mockData, config = {}) {
        // bypass preventivo si se fuerza mock o si no existe URL configurada en el entorno
        if (mockMode) {
            warn(`Usando mocks para "${endpoint}" (${mockModeReason})`)
            return { data: mockData, source: 'mock' }
        }

        try {
            const response = await client.get(endpoint, config)
            return { data: response.data, source: 'api' }
        } catch (error) {
            logNetworkError(endpoint, error)
            throw error
        }
    }

    return { client, mockMode, mockModeReason, request, warn, logNetworkError }
}

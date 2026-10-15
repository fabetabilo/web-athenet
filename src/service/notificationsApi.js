import axios from 'axios'

/**
 * @file notificationsApi.js
 * Escrituras publicas (sin auth) contra el servicio de suscripciones de ms-notifications.
 * Sin fallback a mocks: un fallo nunca debe mostrarse como suscripcion exitosa.
 */

const BASE_URL = import.meta.env.VITE_NOTIFICATIONS_API_URL || ''

const notificationsClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { Accept: 'application/json' },
})

export const NOTIFICATION_ENDPOINTS = {
  SUBSCRIBE: '/subscriptions',
  CONFIRM: '/subscriptions/confirm',
}

const ERROR_KIND_BY_STATUS = {
  400: 'invalid',
  403: 'captcha',
  404: 'invalid',
  410: 'expired',
  429: 'rate',
}

/**
 * Error con un `kind` estable para que la UI elija su mensaje sin conocer codigos HTTP.
 * @typedef {'invalid' | 'captcha' | 'expired' | 'rate' | 'unavailable'} SubscriptionErrorKind
 */
export class SubscriptionError extends Error {
  /** @param {SubscriptionErrorKind} kind */
  constructor(kind, message) {
    super(message)
    this.name = 'SubscriptionError'
    this.kind = kind
  }
}

async function post(endpoint, body) {
  // Sin URL, axios pegaria al host de Vite y recibiria index.html con 200.
  if (!BASE_URL) throw new SubscriptionError('unavailable', 'VITE_NOTIFICATIONS_API_URL no definida')

  try {
    const response = await notificationsClient.post(endpoint, body)
    return response.data
  } catch (error) {
    const kind = ERROR_KIND_BY_STATUS[error.response?.status] ?? 'unavailable'
    throw new SubscriptionError(kind, error.message)
  }
}

/**
 * Registra el correo como pendiente; el backend envia el correo de confirmacion.
 *
 * @param {{ email: string, turnstileToken: string }} payload
 * @throws {SubscriptionError}
 */
export function subscribe({ email, turnstileToken }) {
  return post(NOTIFICATION_ENDPOINTS.SUBSCRIBE, { email, consent: true, turnstileToken })
}

/**
 * Confirma la suscripcion con el token recibido en el correo.
 *
 * @param {string} token
 * @throws {SubscriptionError}
 */
export function confirmSubscription(token) {
  return post(NOTIFICATION_ENDPOINTS.CONFIRM, { token })
}

/**
 * @file chatStream.js
 * Punto de entrada al chat de un partido (api-athenet-chat).
 *
 * El ticket de un solo uso se pide por HTTP con el access token de Cognito (VITE_CHAT_API_URL) y se canjea
 * al abrir el WebSocket (VITE_CHAT_WS_URL). Sin esas URLs, con el modo demo global o con la auth simulada
 * se usa la sala simulada.
 *
 * Estados de `onStatus`: 'live' | 'reconnecting' | 'failed'.
 */
import { AUTH_MOCK_MODE } from '../../auth/authConfig'
import { getAccessToken } from '../../auth/authService'
import { startMockChat } from './mockChatStream'

const API_URL = (import.meta.env.VITE_CHAT_API_URL || '').replace(/\/$/, '')
const WS_URL = (import.meta.env.VITE_CHAT_WS_URL || '').replace(/\/$/, '')
const DEMO_MOCKS = import.meta.env.VITE_USE_DEMO_MOCKS === 'true'

export const CHAT_MOCK_MODE = DEMO_MOCKS || AUTH_MOCK_MODE || !API_URL || !WS_URL

const RETRY_DELAYS_MS = [2000, 5000, 10000, 10000, 10000]

/** Sala del chat de un partido; null si el id no tiene la forma que acepta el servicio. */
export const chatRoomOf = (match) => (/^\d{1,18}$/.test(String(match.id)) ? `MATCH-${match.id}` : null)

async function requestTicket(roomId) {
  const token = await getAccessToken()
  if (!token) throw new Error('Sin sesion')

  const response = await fetch(`${API_URL}/api/ws/ticket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: roomId }),
  })
  if (!response.ok) throw new Error(`Ticket HTTP ${response.status}`)
  return (await response.json()).ticket
}

function startSocket(roomId, { onFrame, onStatus }) {
  let socket = null
  let timer = null
  let attempts = 0
  let closed = false

  const retry = () => {
    if (closed) return
    if (attempts >= RETRY_DELAYS_MS.length) {
      onStatus('failed')
      return
    }
    onStatus('reconnecting')
    timer = setTimeout(connect, RETRY_DELAYS_MS[attempts])
    attempts += 1
  }

  async function connect() {
    let ticket
    try {
      ticket = await requestTicket(roomId)
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[chat]', error.message)
      retry()
      return
    }
    if (closed) return

    const query = `ticket=${encodeURIComponent(ticket)}&roomId=${encodeURIComponent(roomId)}`
    socket = new WebSocket(`${WS_URL}/ws/chat?${query}`)

    socket.onmessage = (event) => {
      let frame
      try {
        frame = JSON.parse(event.data)
      } catch {
        return
      }
      if (frame.type === 'chat.ready') {
        attempts = 0
        onStatus('live')
      }
      onFrame(frame)
    }

    socket.onclose = () => {
      socket = null
      retry()
    }
  }

  connect()

  return {
    send(body, clientMessageId) {
      if (socket?.readyState !== WebSocket.OPEN) return false
      socket.send(JSON.stringify({ type: 'chat.send', clientMessageId, body }))
      return true
    },
    close() {
      closed = true
      clearTimeout(timer)
      socket?.close(1000)
    },
  }
}

/**
 * Abre la sala. `user` es el usuario con sesion o null (en la simulacion entra en solo lectura).
 *
 * @param {string} roomId
 * @param {{ id: string, nombre?: string, apellido?: string, email?: string } | null} user
 * @param {{ onFrame: (frame: object) => void, onStatus: (status: string) => void }} handlers
 * @returns {{ send: (body: string, clientMessageId: string) => boolean, close: () => void }}
 */
export function openChat(roomId, user, handlers) {
  return CHAT_MOCK_MODE ? startMockChat(roomId, user, handlers) : startSocket(roomId, handlers)
}

/**
 * @file matchStream.js
 * Punto de entrada al stream de un partido en vivo.
 *
 * Sin URL configurada (o con el modo demo global) se usa la simulacion local; con VITE_LIVE_MATCH_URL
 * se conecta por SSE al servicio que reenvia los mensajes de Kafka (si usa WebSocket, solo cambia startSse).
 *
 * Estados de `onConnection`: 'live' | 'reconnecting' | 'ended'.
 * Un partido ya jugado no tiene stream: `loadMatchHistory` pide sus eventos guardados.
 */
import { buildMockHistory, startMockMatch } from './mockMatchStream'

const LIVE_URL = (import.meta.env.VITE_LIVE_MATCH_URL || '').replace(/\/$/, '')
const DEMO_MOCKS = import.meta.env.VITE_USE_DEMO_MOCKS === 'true'

export const LIVE_MOCK_MODE = DEMO_MOCKS || !LIVE_URL

// La ruta es provisoria: se acuerda con quien arme el servicio que consume Kafka
function startSse(match, { onEvent, onConnection }) {
  const source = new EventSource(`${LIVE_URL}/matches/${match.id}/events`)

  source.onopen = () => onConnection('live')
  // EventSource reintenta solo; si quedo cerrado, el servidor termino el stream
  source.onerror = () => onConnection(source.readyState === EventSource.CLOSED ? 'ended' : 'reconnecting')
  source.onmessage = (message) => {
    try {
      onEvent(JSON.parse(message.data))
    } catch {
      // un mensaje mal formado no debe tumbar el tablero
    }
  }

  return () => source.close()
}

/**
 * Se suscribe a los eventos de un partido.
 *
 * @param {{ id: number|string }} match
 * @param {{ onEvent: (event: object) => void, onConnection: (state: string) => void }} handlers
 * @returns {() => void} Cancela la suscripcion.
 */
export function subscribeToMatch(match, handlers) {
  return LIVE_MOCK_MODE ? startMockMatch(match, handlers) : startSse(match, handlers)
}

/**
 * Historia de un partido ya jugado: todos sus eventos, con el formato del stream; [] si no hay detalle.
 * La ruta es provisoria, como la del stream.
 *
 * @param {{ id: number|string, one: { score: number|null }, two: { score: number|null } }} match
 * @returns {Promise<Array<object>>}
 */
export async function loadMatchHistory(match) {
  if (LIVE_MOCK_MODE) return buildMockHistory(match)

  const response = await fetch(`${LIVE_URL}/matches/${match.id}/history`, { headers: { Accept: 'application/json' } })
  if (response.status === 404) return []
  if (!response.ok) throw new Error(`No se pudo cargar la historia del partido (${response.status})`)

  const events = await response.json()
  return Array.isArray(events) ? events : []
}

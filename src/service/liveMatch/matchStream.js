/**
 * @file matchStream.js
 * Punto de entrada al stream de un partido en vivo.
 *
 * Sin URL configurada (o con el modo demo global) se usa la simulacion local; con VITE_STATISTICS_API_URL
 * se conecta por STOMP a ms-statistics, que reenvia el topico `marcador` de Kafka.
 *
 * Estados de `onConnection`: 'live' | 'reconnecting' | 'ended'.
 */
import { Client } from '@stomp/stompjs'
import { MATCH_EVENT } from './matchEvents'
import { buildMockHistory, startMockMatch } from './mockMatchStream'

const STATISTICS_URL = (import.meta.env.VITE_STATISTICS_API_URL || '').replace(/\/$/, '')
const DEMO_MOCKS = import.meta.env.VITE_USE_DEMO_MOCKS === 'true'

export const LIVE_MOCK_MODE = DEMO_MOCKS || !STATISTICS_URL

const SOCKET_URL = `${STATISTICS_URL.replace(/^http/, 'ws')}/ws`
const SCORE_TOPIC = '/topic/marcador'
const CURRENT_SCORE_URL = `${STATISTICS_URL}/marcador/actual`

/** Traduce un ScoreEvent del topico marcador a los eventos internos (ver matchEvents.js). */
function toMatchEvents(scoreEvent) {
  const score = { type: MATCH_EVENT.SCORE, home: scoreEvent.puntosLocal, away: scoreEvent.puntosVisita }

  switch (scoreEvent.tipo) {
    case 'INICIADO':
      return [{ id: MATCH_EVENT.START, type: MATCH_EVENT.START }]
    case 'PUNTO':
      return [score]
    case 'FINALIZADO':
      return [score, { id: MATCH_EVENT.FULLTIME, type: MATCH_EVENT.FULLTIME }]
    default:
      return []
  }
}

function startStomp(match, { onEvent, onConnection }) {
  const isThisMatch = (scoreEvent) => String(scoreEvent?.idEncuentro) === String(match.id)
  let receivedLive = false

  const client = new Client({
    brokerURL: SOCKET_URL,
    onConnect: () => {
      onConnection('live')
      receivedLive = false
      client.subscribe(SCORE_TOPIC, (message) => {
        try {
          const scoreEvent = JSON.parse(message.body)
          if (!isThisMatch(scoreEvent)) return
          receivedLive = true
          toMatchEvents(scoreEvent).forEach(onEvent)
        } catch {
          // un mensaje mal formado no debe tumbar el tablero
        }
      })
      // por STOMP solo llegan los cambios: el marcador actual se pide en cada conexion
      // y se descarta si ya llego uno mas nuevo por el topico
      fetch(CURRENT_SCORE_URL, { headers: { Accept: 'application/json' } })
        .then((response) => (response.status === 200 ? response.json() : null))
        .then((current) => {
          if (isThisMatch(current) && !receivedLive) toMatchEvents(current).forEach(onEvent)
        })
        .catch(() => {})
    },
    onWebSocketClose: () => onConnection('reconnecting'),
  })

  client.activate()
  return () => client.deactivate()
}

/**
 * Se suscribe a los eventos de un partido.
 *
 * @param {{ id: number|string }} match
 * @param {{ onEvent: (event: object) => void, onConnection: (state: string) => void }} handlers
 * @returns {() => void} Cancela la suscripcion.
 */
export function subscribeToMatch(match, handlers) {
  return LIVE_MOCK_MODE ? startMockMatch(match, handlers) : startStomp(match, handlers)
}

/**
 * Historia de un partido ya jugado: todos sus eventos, con el formato del stream; [] si no hay detalle.
 * ms-statistics no guarda historia, asi que en modo real no hay detalle.
 *
 * @param {{ id: number|string, one: { score: number|null }, two: { score: number|null } }} match
 * @returns {Promise<Array<object>>}
 */
export async function loadMatchHistory(match) {
  return LIVE_MOCK_MODE ? buildMockHistory(match) : []
}

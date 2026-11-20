import { useEffect, useReducer, useState } from 'react'
import { createMatchState, matchReducer, replayHistory } from './matchEvents'
import { loadMatchHistory, subscribeToMatch } from './matchStream'

/**
 * Estado de un partido para la vista.
 *  - En vivo o por jugar: aplica cada evento del stream (marcador, estadisticas, cronologia).
 *  - Ya jugado: sin conexion; reproduce la historia guardada. Mientras carga o si falta
 *    (`historyStatus` 'loading'/'missing') trae solo el marcador final del fixture.
 * Debe remontarse (key) al cambiar de partido.
 *
 * @param {import('../../utils/normalizeMatch').NormalizedMatch} match
 * @returns {{
 *   state: ReturnType<typeof createMatchState>,
 *   connection: 'connecting'|'live'|'reconnecting'|'ended',
 *   historyStatus: 'none'|'loading'|'ready'|'missing'
 * }}
 */
export default function useLiveMatch(match) {
  const [liveState, dispatch] = useReducer(matchReducer, match, createMatchState)
  const [connection, setConnection] = useState(match.isPlayed ? 'ended' : 'connecting')
  const [history, setHistory] = useState({ status: match.isPlayed ? 'loading' : 'none', state: null })

  useEffect(() => {
    if (!match.isPlayed) return subscribeToMatch(match, { onEvent: dispatch, onConnection: setConnection })

    let active = true
    loadMatchHistory(match)
      .then((events) => {
        if (!active) return
        setHistory(events.length > 0
          ? { status: 'ready', state: replayHistory(match, events) }
          : { status: 'missing', state: null })
      })
      .catch(() => {
        if (active) setHistory({ status: 'missing', state: null })
      })
    return () => {
      active = false
    }
  }, [match])

  const state = match.isPlayed ? history.state ?? createMatchState(match) : liveState
  return { state, connection, historyStatus: history.status }
}

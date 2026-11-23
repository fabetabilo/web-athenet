import { useCallback, useEffect, useReducer, useRef } from 'react'
import { CHAT_MOCK_MODE, openChat } from './chatStream'

const MAX_MESSAGES = 200

const initialState = { status: 'connecting', me: null, messages: [], notice: '' }

function reducer(state, action) {
  switch (action.type) {
    case 'status':
      return { ...state, status: action.status }
    case 'chat.ready':
      return { ...state, me: action.you ?? null }
    case 'chat.history':
      return { ...state, messages: action.messages }
    case 'chat.message': {
      const rest = action.clientMessageId
        ? state.messages.filter((message) => message.clientMessageId !== action.clientMessageId)
        : state.messages
      return { ...state, messages: [...rest, action.data].slice(-MAX_MESSAGES) }
    }
    case 'pending':
      return { ...state, notice: '', messages: [...state.messages, action.message] }
    case 'error': {
      const index = state.messages.findIndex((message) => message.pending)
      const messages = index < 0 ? state.messages : state.messages.filter((_, position) => position !== index)
      return { ...state, notice: action.message, messages }
    }
    default:
      return state
  }
}

/**
 * Sala de chat de un partido. Debe remontarse (key) al cambiar de usuario.
 * Sin sesion: en la simulacion se lee en solo lectura; en modo real queda 'locked' (el servicio exige sesion).
 *
 * @param {string} roomId
 * @param {{ id: string } | null} user
 * @returns {{
 *   status: 'connecting'|'live'|'reconnecting'|'failed'|'locked',
 *   me: { sub: string, displayName: string } | null,
 *   messages: Array<object>,
 *   notice: string,
 *   canWrite: boolean,
 *   send: (body: string) => boolean
 * }}
 */
export default function useLiveChat(roomId, user) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const chatRef = useRef(null)
  const locked = !user && !CHAT_MOCK_MODE

  useEffect(() => {
    if (locked) return undefined
    const chat = openChat(roomId, user, {
      onFrame: dispatch,
      onStatus: (status) => dispatch({ type: 'status', status }),
    })
    chatRef.current = chat
    return () => {
      chatRef.current = null
      chat.close()
    }
  }, [roomId, user, locked])

  const { me } = state
  const send = useCallback(
    (body) => {
      const text = body.trim()
      if (!text || !me) return false
      const clientMessageId = crypto.randomUUID()
      if (!chatRef.current?.send(text, clientMessageId)) return false
      dispatch({
        type: 'pending',
        message: {
          messageId: clientMessageId,
          clientMessageId,
          pending: true,
          authorSub: me.sub,
          authorDisplayName: me.displayName,
          body: text,
          sentAt: new Date().toISOString(),
        },
      })
      return true
    },
    [me],
  )

  return {
    status: locked ? 'locked' : state.status,
    me,
    messages: state.messages,
    notice: state.notice,
    canWrite: Boolean(user && me) && state.status === 'live',
    send,
  }
}

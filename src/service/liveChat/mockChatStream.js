/**
 * @file mockChatStream.js
 * Sala simulada con los mismos marcos y limites que api-athenet-chat. Los mensajes viven en memoria
 * mientras la pestana siga abierta.
 */

const MAX_BODY_LENGTH = 500
const HISTORY_SIZE = 50
const RATE_LIMIT_MESSAGES = 5
const RATE_LIMIT_WINDOW_MS = 10_000

// Nombres y frases inventados, solo para la simulacion
const FANS = ['Camila R.', 'Diego M.', 'Valentina S.', 'Matías F.', 'Josefa A.', 'Benjamín L.', 'Antonia P.', 'Tomás V.']
const LINES = [
  '¡Vamos equipo!',
  'Qué partidazo',
  'La defensa está firme hoy',
  'Aguanten, falta poco',
  'Buena jugada por la banda',
  'El arquero está atajando todo',
  'Hay que presionar más arriba',
  'Saludos desde la galería',
  'Este segundo tiempo pinta bueno',
  '¡Esa estuvo cerca!',
]

const rooms = new Map()

const between = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
const pick = (list) => list[Math.floor(Math.random() * list.length)]

function fanMessage(roomId, sentAt = new Date()) {
  const index = between(0, FANS.length - 1)
  return {
    messageId: crypto.randomUUID(),
    roomId,
    authorSub: `mock-fan-${index}`,
    authorDisplayName: FANS[index],
    body: pick(LINES),
    sentAt: sentAt.toISOString(),
  }
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    const now = Date.now()
    rooms.set(roomId, [6, 5, 4, 2, 1].map((minutesAgo) => fanMessage(roomId, new Date(now - minutesAgo * 60_000))))
  }
  return rooms.get(roomId)
}

const displayNameOf = (user) => [user.nombre, user.apellido].filter(Boolean).join(' ') || user.email || 'Usuario Athenet'

export function startMockChat(roomId, user, { onFrame, onStatus }) {
  const room = getRoom(roomId)
  const me = user ? { sub: user.id, displayName: displayNameOf(user) } : null
  const sentAt = []
  const timers = new Set()

  const later = (callback, ms) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      callback()
    }, ms)
    timers.add(timer)
  }

  const publish = (message, clientMessageId = null) => {
    room.push(message)
    if (room.length > HISTORY_SIZE) room.shift()
    onFrame({ type: 'chat.message', clientMessageId, data: message })
  }

  const scheduleFan = () =>
    later(() => {
      publish(fanMessage(roomId))
      scheduleFan()
    }, between(8000, 15000))

  const reject = (status, message) => later(() => onFrame({ type: 'error', status, message }), 150)

  later(() => {
    onStatus('live')
    onFrame({ type: 'chat.ready', roomId, you: me })
    onFrame({ type: 'chat.history', roomId, messages: [...room] })
    scheduleFan()
  }, 400)

  return {
    send(body, clientMessageId) {
      if (!me) return false
      const text = body.trim()
      if (!text) {
        reject(400, 'El mensaje viene vacio.')
        return true
      }
      if (text.length > MAX_BODY_LENGTH) {
        reject(400, `El mensaje supera los ${MAX_BODY_LENGTH} caracteres.`)
        return true
      }

      const now = Date.now()
      while (sentAt.length > 0 && now - sentAt[0] >= RATE_LIMIT_WINDOW_MS) sentAt.shift()
      if (sentAt.length >= RATE_LIMIT_MESSAGES) {
        reject(429, 'Demasiados mensajes, espera unos segundos.')
        return true
      }
      sentAt.push(now)

      later(() => {
        publish(
          {
            messageId: crypto.randomUUID(),
            roomId,
            authorSub: me.sub,
            authorDisplayName: me.displayName,
            body: text,
            sentAt: new Date().toISOString(),
          },
          clientMessageId,
        )
      }, 250)
      return true
    },
    close() {
      timers.forEach(clearTimeout)
      timers.clear()
    },
  }
}

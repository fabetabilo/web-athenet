import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button/Button'
import { useAuth } from '../../auth/useAuth'
import { CHAT_MOCK_MODE } from '../../service/liveChat/chatStream'
import useLiveChat from '../../service/liveChat/useLiveChat'
import styles from './MatchChat.module.css'

const MAX_BODY_LENGTH = 500

const STATUS_LABEL = {
  connecting: 'Conectando…',
  live: 'En línea',
  reconnecting: 'Reconectando…',
  failed: 'Sin conexión',
}

const formatTime = (iso) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

function ChatRoom({ roomId, user, onRetry }) {
  const { authEnabled, openAuth } = useAuth()
  const { status, me, messages, notice, canWrite, send } = useLiveChat(roomId, user)
  const [draft, setDraft] = useState('')
  const listRef = useRef(null)
  const followRef = useRef(true)

  useEffect(() => {
    const list = listRef.current
    if (list && followRef.current) list.scrollTop = list.scrollHeight
  }, [messages])

  const handleScroll = (event) => {
    const list = event.currentTarget
    followRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 48
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    followRef.current = true
    if (send(draft)) setDraft('')
  }

  let body
  if (status === 'locked') {
    body = <p className={styles.empty}>Inicia sesión para ver la conversación del partido.</p>
  } else if (status === 'failed') {
    body = (
      <div className={styles.empty}>
        <p>No se pudo conectar al chat.</p>
        <Button variant="light" size="md" onClick={onRetry}>Reintentar</Button>
      </div>
    )
  } else if (messages.length === 0) {
    body = (
      <p className={styles.empty}>
        {status === 'live' ? 'Aún no hay mensajes. ¡Escribe el primero!' : 'Cargando la conversación…'}
      </p>
    )
  } else {
    body = (
      <ol ref={listRef} className={styles.list} role="log" aria-label="Mensajes del chat" onScroll={handleScroll}>
        {messages.map((message) => {
          const mine = message.authorSub === me?.sub
          return (
            <li
              key={message.messageId}
              className={`${styles.message} ${mine ? styles.mine : ''} ${message.pending ? styles.pending : ''}`}
            >
              <span className={styles.meta}>
                <span className={styles.author}>{mine ? 'Tú' : message.authorDisplayName}</span>
                <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
              </span>
              <p className={styles.bubble}>{message.body}</p>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <>
      <header className={styles.header}>
        <h2 className={styles.title}>Chat del partido</h2>
        {STATUS_LABEL[status] && (
          <span className={styles.status}>
            <span className={`${styles.dot} ${status === 'live' ? styles.dotOn : ''}`} aria-hidden="true" />
            {STATUS_LABEL[status]}
            {CHAT_MOCK_MODE && <span className={styles.mock}>· Simulado</span>}
          </span>
        )}
      </header>

      {body}

      {notice && (
        <p className={styles.notice} role="alert">
          {notice}
        </p>
      )}

      {user ? (
        <form className={styles.footer} onSubmit={handleSubmit}>
          <label htmlFor={`chat-input-${roomId}`} className={styles.srOnly}>
            Escribe un mensaje
          </label>
          <input
            id={`chat-input-${roomId}`}
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_BODY_LENGTH}
            placeholder="Escribe un mensaje…"
            autoComplete="off"
            disabled={!canWrite}
          />
          <Button type="submit" variant="accent" size="sm" disabled={!canWrite || !draft.trim()}>
            Enviar
          </Button>
        </form>
      ) : (
        authEnabled && (
          <div className={styles.footer}>
            <Button variant="accent" size="md" className={styles.cta} onClick={() => openAuth('login')}>
              Inicia sesión para comentar
            </Button>
          </div>
        )
      )}
    </>
  )
}

/**
 * Chat en vivo del partido, al costado de las estadisticas. Cualquiera lo lee en la simulacion;
 * escribir exige sesion.
 *
 * @param {{ roomId: string }} props
 */
export default function MatchChat({ roomId }) {
  const { user, status } = useAuth()
  const [round, setRound] = useState(0)

  return (
    <aside className={styles.chat} aria-label="Chat del partido">
      {status === 'loading' ? (
        <p className={styles.empty}>Cargando…</p>
      ) : (
        <ChatRoom
          key={`${user?.id ?? 'visitante'}-${round}`}
          roomId={roomId}
          user={user}
          onRetry={() => setRound((current) => current + 1)}
        />
      )}
    </aside>
  )
}

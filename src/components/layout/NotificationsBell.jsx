import { useEffect, useRef, useState } from 'react'
import { Bell } from '../icons'
import styles from './NotificationsBell.module.css'

/**
 * Campanita de notificaciones del Navbar (desktop), con un panel de lista.
 *
 * TODO(backend): no hay endpoint de notificaciones por usuario (`notificationsApi` solo cubre el
 * newsletter). Al existir, reemplazar `notifications` (item: `{ id, title, body, createdAt, read }`).
 */
export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications] = useState([])
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  const unread = notifications.filter((item) => !item.read).length

  // Cierra al hacer clic fuera o con Escape (devuelve el foco al boton)
  useEffect(() => {
    if (!open) return undefined

    const closeIfOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
        aria-expanded={open}
        aria-controls="notifications-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell aria-hidden="true" />
        {unread > 0 && <span className={styles.badge} aria-hidden="true" />}
      </button>

      {open && (
        <div id="notifications-panel" className={styles.panel}>
          <strong className={styles.title}>Notificaciones</strong>
          {notifications.length === 0 ? (
            <p className={styles.empty}>No tienes notificaciones nuevas.</p>
          ) : (
            <ul className={styles.list}>
              {notifications.map((item) => (
                <li key={item.id} className={styles.item}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

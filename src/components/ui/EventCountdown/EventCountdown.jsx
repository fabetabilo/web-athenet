import { MapPin } from '../../icons'
import Button from '../Button/Button'
import Countdown from '../Countdown/Countdown'
import TeamChipList from '../TeamChip/TeamChipList'
import styles from './EventCountdown.module.css'

/**
 * Muestra una sección de cuenta regresiva para el próximo evento.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeEvent').NormalizedEvent} props.event - evento normalizado
 */
export default function EventCountdown({ event }) {
  if (!event) return null

  return (
    <section className={styles.countdown}>
      <div className={styles.inner}>
        <div className={styles.main}>
          <span className={styles.label}>Próxima Fecha</span>
          <Countdown date={event.startsAt} size="lg" />

          <h2 className={styles.title}>{event.title}</h2>
          <p className={styles.location}>
            <MapPin size={24} strokeWidth={1} aria-hidden="true" />
            {event.location}
            {/* formattedDate viene pre-calculado desde normalizeEvent (timezone-safe) */}
            <span className={styles.dateSep} aria-hidden="true">|</span>
            <span className={styles.date}>{event.formattedDate}</span>
          </p>
          <TeamChipList event={event} />
          <Button variant="solid" showArrow to={`/events/${event.id}`} style={{ marginTop: 'var(--spacing-sm)' }}>
            Ver Evento
          </Button>
        </div>
        {/* columna derecha reservada: contenido PENDIENTE */}
        <div className={styles.aside} aria-hidden="true" />
      </div>
    </section>
  )
}

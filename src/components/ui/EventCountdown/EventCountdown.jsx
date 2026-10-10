import { useState, useEffect } from 'react'
import { MapPin } from '../../icons'
import Button from '../Button/Button'
import TeamChipList from '../TeamChip/TeamChipList'
import styles from './EventCountdown.module.css'

/**
 * Calcula el tiempo restante hacia una fecha ISO "YYYY-MM-DD".
 * Se usa `isoDate + 'T00:00:00'` para forzar interpretación en hora local
 * y evitar desfases de timezone al calcular la diferencia.
 *
 * @param {string} isoDate - Fecha en formato "YYYY-MM-DD"
 */
function getTimeLeft(isoDate) {
  const target = new Date(isoDate + 'T00:00:00')
  const diff = target - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

/**
 * Muestra una sección de cuenta regresiva para el próximo evento.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeEvent').NormalizedEvent} props.event - evento normalizado
 */
export default function EventCountdown({ event }) {
  // Usa event.eventDate (ISO "YYYY-MM-DD")
  const [timeLeft, setTimeLeft] = useState(() =>
    event?.eventDate ? getTimeLeft(event.eventDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  )

  useEffect(() => {
    if (!event?.eventDate) return
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeLeft(event.eventDate))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [event?.eventDate])

  if (!event) return null

  const units = [
    { value: timeLeft.days,    label: 'Días' },
    { value: timeLeft.hours,   label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ]

  return (
    <section className={styles.countdown}>
      <div className={styles.inner}>
        <div className={styles.main}>
          <span className={styles.label}>Próxima Fecha</span>
          {/* --- timer */}
          <div className={styles.timer}>
            {units.map((unit, i) => (
              <div key={unit.label} className={styles.unit}>
                <span className={styles.value}>
                  {String(unit.value).padStart(2, '0')}
                  {i < units.length - 1 && <span className={styles.sep} aria-hidden="true">:</span>}
                </span>
                <span className={styles.unitLabel}>
                  {unit.label}
                  <span className={styles.rule} aria-hidden="true" />
                </span>
              </div>
            ))}
          </div>

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

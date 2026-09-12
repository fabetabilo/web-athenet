import { useState, useEffect } from 'react'
import { MapPin } from '../icons'
import Button from '../Button/Button'
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
    { value: timeLeft.hours,   label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' },
  ]

  return (
    <section className={styles.countdown}>
      <div className={styles.inner}>
        <div className={styles.info}>
          <span className={styles.label}>Próxima Fecha</span>
          <h2 className={styles.title}>{event.title}</h2>
          {/* formattedDate viene pre-calculado desde normalizeEvent (timezone-safe) */}
          <p className={styles.date}>{event.formattedDate}</p>
          <p className={styles.location}>
            <MapPin size={32} strokeWidth={1} aria-hidden="true" />
            {event.location}
          </p>
          <Button variant="accent" showArrow href={`/events/${event.id}`} style={{ marginTop: 'var(--spacing-sm)' }}>
            Ver Evento
          </Button>
        </div>
        {/* --- timer */}
        <div className={styles.timer}>
          <span className={styles.timerLabel}>Faltan</span>
          <div className={styles.boxes}>
            {units.map((unit) => (
              <div key={unit.label} className={styles.box}>
                <span className={styles.value}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className={styles.unit}>{unit.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

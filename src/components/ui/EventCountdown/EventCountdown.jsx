import { useState, useEffect } from 'react'
import { MapPin } from '../icons'
import Button from '../Button/Button'
import styles from './EventCountdown.module.css'

// formatea string ISO "YYYY-MM-DD" a "23 de Septiembre, 2026"
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// --- calcula el tiempo restante hacia fecha ISO
// CONSIDERACION: ahora mismo se hace el calculo, mas adelante, se podria implementar LocalDateTime desde la api para ahorrar esto.
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
 * @param {Object} props.event - Objeto del evento próximo.
 * @param {number} props.event.id - ID del evento.
 * @param {string} props.event.title - Nombre del evento.
 * @param {string} props.event.date - Fecha ISO "YYYY-MM-DD" (LocalDate).
 * @param {string} props.event.location - Lugar del evento.
 */
export default function EventCountdown({ event }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(event.date))

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(event.date))
    }, 1000)
    return () => clearInterval(id)
  }, [event.date])

  const formattedDate = formatDate(event.date)

  const units = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' },
  ]

  return (
    <section className={styles.countdown}>
      <div className={styles.inner}>
        <div className={styles.info}>
          <span className={styles.label}>Próxima Fecha</span>
          <h2 className={styles.title}>{event.title}</h2>
          <p className={styles.date}>{formattedDate}</p>
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

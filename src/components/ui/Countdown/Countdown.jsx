import { useState, useEffect } from 'react'
import styles from './Countdown.module.css'

/**
 * Arma la fecha en hora local por componentes: el backend no envia zona horaria.
 * @param {string} dateTime - "YYYY-MM-DDTHH:mm"
 */
function parseLocalDateTime(dateTime) {
  const [datePart, timePart = '00:00'] = dateTime.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hours || 0, minutes || 0)
}

/** @param {string} dateTime - "YYYY-MM-DDTHH:mm" */
function getTimeLeft(dateTime) {
  const diff = parseLocalDateTime(dateTime) - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

/**
 * Cuenta regresiva hacia una fecha. Comparte markup y estilo entre
 * la sección EventCountdown y cards de evento.
 *
 * @param {Object} props
 * @param {string} props.date - Fecha y hora objetivo, "YYYY-MM-DDTHH:mm" (la hora es opcional)
 * @param {'sm'|'lg'} [props.size] - 'lg' para la sección, 'sm' para cards
 * @param {string} [props.className]
 */
export default function Countdown({ date, size = 'lg', className = '' }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    date ? getTimeLeft(date) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  )

  useEffect(() => {
    if (!date) return
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeLeft(date))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [date])

  if (!date) return null

  const units = [
    { value: timeLeft.days,    label: 'Días' },
    { value: timeLeft.hours,   label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ]

  return (
    <div className={`${styles.timer} ${styles[size]} ${className}`}>
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
  )
}

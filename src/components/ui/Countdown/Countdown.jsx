import { useState, useEffect } from 'react'
import styles from './Countdown.module.css'

/**
 * Calcula el tiempo restante hacia una fecha ISO "YYYY-MM-DD".
 * Se usa `isoDate + 'T00:00:00'`
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
 * Cuenta regresiva hacia una fecha. Comparte markup y estilo entre
 * la sección EventCountdown y cards de evento.
 *
 * @param {Object} props
 * @param {string} props.date - Fecha objetivo en formato ISO "YYYY-MM-DD"
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

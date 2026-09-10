import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight } from '../icons'
import styles from './Event.module.css'

/**
 * EventCard
 * Card reutilizable para un evento individual.
 *
 * @param {object}  event - Datos del evento
 * @param {boolean} isPrincipal - Si es la card activa/principal del carrusel (activa)
 */
export default function EventCard({ event, isPrincipal = false }) {
  const navigate = useNavigate()

  return (
    <div 
      className={`${styles.card} ${isPrincipal ? styles.principalCard : ''}`}
      onClick={() => navigate(`/events/${event.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.cardImageWrapper}>
        <img src={event.image} alt={event.title} className={styles.cardImage} />
        <div className={styles.pill}>{event.category}</div>
        <div className={styles.cardMeta}>
          {event.location && (
            <span className={styles.cardLocation}>
              <MapPin className={styles.locationIcon} />
              {event.location}
            </span>
          )}
          <h3 className={styles.cardTitle}>{event.title}</h3>
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <div className={styles.dateInfo}>
          <span className={styles.dateDays}>{event.days}</span>
          <div className={styles.dateMonthYear}>
            <span className={styles.dateMonth}>{event.month}</span>
            <span className={styles.dateYear}>{event.year}</span>
          </div>
        </div>
        <button
          className={styles.footerBtn}
          aria-label={`Ver detalles de ${event.title}`}
          onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
        >
          <ArrowRight className={styles.footerIcon} />
        </button>
      </div>
    </div>
  )
}

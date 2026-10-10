import { MapPin, OfficialIconH } from '../../icons'
import Button from '../Button/Button'
import Pill from '../Pill/Pill'
import TeamChipList from '../TeamChip/TeamChipList'
import styles from './Event.module.css'

/**
 * EventCard
 * Card reutilizable para un evento individual.
 *
 * @param {import('../../../utils/normalizeEvent').NormalizedEvent} event - Evento ya normalizado
 * @param {boolean} isPrincipal - Si es la card activa/principal del carrusel
 */
export default function EventCard({ event, isPrincipal = false }) {
  return (
    <article className={`${styles.card} ${isPrincipal ? styles.principalCard : ''}`}>
      <img src={event.image} alt={event.title} className={styles.cardImage} />

      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <Pill>{event.categoryLabel}</Pill>
          {event.isOfficial && (
            <OfficialIconH className={styles.officialBadgeImg} aria-label="Evento oficial verificado" />
          )}
        </div>

        <h3 className={styles.cardTitle}>{event.title}</h3>

        <p className={styles.cardLocation}>
          {event.location && (
            <>
              <MapPin size={24} strokeWidth={1} aria-hidden="true" />
              {event.location}
              <span className={styles.dateSep} aria-hidden="true">|</span>
            </>
          )}
          {/* formattedDate viene pre-calculado desde normalizeEvent (timezone-safe) */}
          <span className={styles.cardDate}>{event.formattedDate}</span>
        </p>
        <div className={styles.teamsSlot}>
          <TeamChipList event={event} />
        </div>

        <Button
          variant="solid"
          size="md"
          showArrow
          to={`/events/${event.id}`}
          className={styles.cardAction}
          aria-label={`Ver detalles de ${event.title}`}
        >
          Más Información
        </Button>
      </div>
    </article>
  )
}

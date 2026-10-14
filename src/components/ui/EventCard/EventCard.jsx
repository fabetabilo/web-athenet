import { MapPin, OfficialIconH } from '../../icons'
import Button from '../Button/Button'
import Countdown from '../Countdown/Countdown'
import Pill from '../Pill/Pill'
import TeamChipList from '../TeamChip/TeamChipList'
import styles from './EventCard.module.css'

/**
 * EventCard
 * Card reutilizable para un evento individual.
 *
 * @param {import('../../../utils/normalizeEvent').NormalizedEvent} event - Evento ya normalizado
 * @param {boolean} isPrincipal - Si es la card activa/principal del carrusel
 * @param {boolean} showCountdown - Muestra la cuenta regresiva junto al boton (no se usa en el carrusel del home)
 */
export default function EventCard({ event, isPrincipal = false, showCountdown = false }) {
  return (
    <article className={`${styles.card} ${isPrincipal ? styles.principalCard : ''}`}>
      <img src={event.image} alt={event.title} className={styles.cardImage} />

      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          {event.sportLabel && <Pill>{event.sportLabel}</Pill>}
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

        <div className={styles.cardFooter}>
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

          {showCountdown && <Countdown date={event.startsAt} size="sm" />}
        </div>
      </div>
    </article>
  )
}

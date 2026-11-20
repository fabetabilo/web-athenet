import { useTransitionNavigate } from '../../transition'
import Button from '../Button/Button'
import EventCard from '../EventCard/EventCard'
import CarouselNav from './CarouselNav'
import { useCarousel } from './useCarousel'
import styles from './EventsCarousel.module.css'

export default function EventsCarousel({ events = [] }) {
  const { index, next, prev, canNavigate, trackStyle } = useCarousel(events.length)
  const navigate = useTransitionNavigate()

  return (
    <section className={styles.eventsSection}>
      <div className={styles.backgroundLeftGradient}></div>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>SIGUIENTES EVENTOS</h2>
          </div>
          <div className={styles.headerRight}>
            <Button variant="dark" onClick={() => navigate('/events')}>TODOS LOS EVENTOS</Button>
            <CarouselNav
              onPrev={prev}
              onNext={next}
              disabled={!canNavigate}
              prevLabel="Evento anterior"
              nextLabel="Evento siguiente"
            />
          </div>
        </div>

        <div className={styles.carouselContainer}>
          <div className={styles.carouselTrack} style={trackStyle}>
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                isPrincipal={i === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

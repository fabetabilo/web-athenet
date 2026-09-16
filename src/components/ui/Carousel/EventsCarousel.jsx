import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from '../icons'
import Button from '../Button/Button'
import EventCard from '../EventCard/EventCard'
import styles from './EventsCarousel.module.css'

export default function EventsCarousel({ events = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % events.length)
  }

  const handlePrev = () => {
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
  }

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
            <div className={styles.navButtons}>
              <button className={styles.navBtn} onClick={handlePrev} aria-label="Evento anterior">
                <ChevronLeft className={styles.navIcon} />
              </button>
              <button className={styles.navBtn} onClick={handleNext} aria-label="Evento siguiente">
                <ChevronRight className={styles.navIcon} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.carouselContainer}>
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(calc(-${currentIndex} * (var(--card-width) + var(--gap))))`
            }}
          >
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                isPrincipal={index === currentIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

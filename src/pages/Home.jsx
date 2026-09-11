import Carousel from '../components/ui/Carousel/Carousel'
import EventsCarousel from '../components/ui/Carousel/EventsCarousel'
import EventCountdown from '../components/ui/EventCountdown/EventCountdown'
import BoldBanner from '../components/ui/Banner/BoldBanner'
import InstCarousel from '../components/ui/Carousel/InstCarousel'
import Button from '../components/ui/Button/Button'
import { nextEvents } from '../data/nextEvents'
import { nextEvent } from '../data/nextEvent'
import { heroSlides } from '../data/heroSlides'
import { institutions } from '../data/institutions'
import { newsCards } from '../data/newsCards.js'
import { normalizeEvent } from '../utils/normalizeEvent'
import styles from './Home.module.css'

// Normalizar datos antes de pasarlos a los componentes.
// Cuando se integre el API real, estos vendrán de los fetches correspondientes.
const normalizedNextEvents = nextEvents.map(normalizeEvent).filter((e) => e.isVisible)
const normalizedNextEvent = normalizeEvent(nextEvent)

export default function Home() {
  const featured = newsCards.find((c) => c.featured)
  const rest = newsCards.filter((c) => !c.featured)

  return (
    <>
      <Carousel slides={heroSlides} />
      <EventCountdown event={normalizedNextEvent} />
      <EventsCarousel events={normalizedNextEvents} />
      <BoldBanner outlineText="36+INSTITUCIONES" solidText="Un solo equipo" />
      <InstCarousel institutions={institutions} />
      <section className={styles.section}>
        <div className={styles.inner}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.bar} />
              <h2 className={styles.title}>Top Historias</h2>
            </div>
            <Button variant="light" showArrow={true} href="#" className={styles.seeAll}>
              Ver Todo
            </Button>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {/* Featured */}
            <a href="#" className={styles.featured}>
              <img src={featured.image} alt={featured.title} className={styles.featuredImg} />
              <div className={styles.featuredOverlay} />
              <div className={styles.featuredBody}>
                <span className={styles.cat}>{featured.category}</span>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <p className={styles.date}>{featured.date}</p>
              </div>
            </a>

            {/* Side stack */}
            <div className={styles.side}>
              {rest.map((card) => (
                <a key={card.id} href="#" className={styles.sideCard}>
                  <div className={styles.sideThumb}>
                    <img src={card.image} alt={card.title} className={styles.sideThumbImg} />
                    <div className={styles.sideThumbOverlay} />
                  </div>
                  <div className={styles.sideBody}>
                    <span className={styles.sideCat}>{card.category}</span>
                    <h4 className={styles.sideTitle}>{card.title}</h4>
                    <p className={styles.sideDate}>{card.date}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

import { useState, useEffect } from 'react'
import { useTransitionHold } from '../components/transition'
import Carousel from '../components/ui/Carousel/Carousel'
import EventsCarousel from '../components/ui/Carousel/EventsCarousel'
import CompetitionsCarousel from '../components/ui/Carousel/CompetitionsCarousel'
import EventCountdown from '../components/ui/EventCountdown/EventCountdown'
import MatchStrip from '../components/ui/MatchStrip/MatchStrip'
import BoldBanner from '../components/ui/Banner/BoldBanner'
import InstCarousel from '../components/ui/Carousel/InstCarousel'
import Button from '../components/ui/Button/Button'
import { heroSlides } from '../data/content/heroSlides'
import { newsCards } from '../data/content/newsCards.js'
import { getNextEvent, getNextEvents } from '../service/eventsApi'
import { getCompetitions, getCurrentCompetitionMatches } from '../service/competitionsApi'
import { getInstitutions } from '../service/institutionsApi'
import styles from './Home.module.css'

/**
 * Valor de una promesa resuelta, o el vacio que la seccion renderiza.
 * Cada seccion del Home degrada por su cuenta: un servicio caido no borra las otras.
 */
const settled = (result, emptyValue) => (result.status === 'fulfilled' ? result.value : emptyValue)

export default function Home() {
  const [featuredEvent, setFeaturedEvent] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [results, setResults] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [competitions, setCompetitions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useTransitionHold(isLoading)

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([
      getNextEvent(),
      getNextEvents(),
      getCurrentCompetitionMatches(),
      getInstitutions(),
      getCompetitions(),
    ]).then(
      ([event, events, matches, insts, comps]) => {
        if (!isMounted) return
        setFeaturedEvent(settled(event, null))
        setUpcomingEvents(settled(events, []).filter((e) => e.isVisible))
        setResults(settled(matches, []))
        setInstitutions(settled(insts, []))
        setCompetitions(settled(comps, []))
        setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
    }
  }, [])

  const featured = newsCards.find((c) => c.featured)
  const rest = newsCards.filter((c) => !c.featured)

  return (
    <>
      <Carousel slides={heroSlides} />
      <MatchStrip matches={results} />
      <EventCountdown event={featuredEvent} />
      <EventsCarousel events={upcomingEvents} />
      <CompetitionsCarousel competitions={competitions} getLink={(c) => `/competitions/${c.id}`} />
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
            <Button variant="light" showArrow={true} href="#">
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

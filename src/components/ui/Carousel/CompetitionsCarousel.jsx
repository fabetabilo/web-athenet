import { TransitionLink } from '../../transition'
import CompetitionCard from '../CompetitionCard/CompetitionCard'
import CarouselNav from './CarouselNav'
import { useCarousel } from './useCarousel'
import styles from './CompetitionsCarousel.module.css'

/**
 * @param {import('../../../utils/normalizeCompetition').NormalizedCompetition[]} competitions
 * @param {string} [title]
 * @param {(competition) => string} [getLink] - Ruta de detalle por competencia (opcional)
 * @param {string} [viewAllTo] - Ruta del listado completo; si viene, muestra el enlace "Ver todas"
 */
export default function CompetitionsCarousel({ competitions = [], title = 'COMPETENCIAS', getLink, viewAllTo }) {
  const { next, prev, canNavigate, trackStyle } = useCarousel(competitions.length)

  if (competitions.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {viewAllTo && <TransitionLink to={viewAllTo} className={styles.viewAll}>Ver todas</TransitionLink>}
          <CarouselNav
            onPrev={prev}
            onNext={next}
            disabled={!canNavigate}
            prevLabel="Competencia anterior"
            nextLabel="Competencia siguiente"
            variant="light"
          />
        </div>

        <div className={styles.viewport}>
          <div className={styles.track} style={trackStyle}>
            {competitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                to={getLink?.(competition)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

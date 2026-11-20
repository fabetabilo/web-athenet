import { TransitionLink } from '../../transition'
import styles from './CompetitionCard.module.css'

/**
 * @param {import('../../../utils/normalizeCompetition').NormalizedCompetition} competition
 * @param {string} [to] - Ruta de detalle; si no viene, la card no es link
 */
export default function CompetitionCard({ competition, to }) {
  const content = competition.competitionImg ? (
    <img src={competition.competitionImg} alt={competition.name} className={styles.image} />
  ) : (
    <span className={styles.fallback}>{competition.name}</span>
  )

  if (to) {
    return (
      <TransitionLink to={to} className={`${styles.card} ${styles.link}`} aria-label={`Ver ${competition.name}`}>
        {content}
      </TransitionLink>
    )
  }

  return <article className={styles.card}>{content}</article>
}

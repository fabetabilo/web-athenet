import { TransitionLink } from '../../transition'
import styles from './TeamStandings.module.css'

/**
 * Top 5 del ranking en tarjetas verticales.
 *
 * @param {import('../../../utils/normalizeRanking').NormalizedRankingRow[]} rows - Filas ya ordenadas por posicion
 * @param {(row) => string} [getLink] - Ruta del equipo; sin ella las cards no son link
 */
export default function TeamStandings({ rows = [], getLink }) {
  const top = rows.slice(0, 5)
  if (top.length === 0) return null

  return (
    <ol className={styles.list} aria-label="Top 5 del ranking">
      {top.map((row) => {
        const to = getLink?.(row)
        const content = (
          <>
            <span className={styles.position} aria-hidden="true">{row.position}</span>

            <div className={styles.emblem}>
              {row.team.logo ? (
                <img src={row.team.logo} alt="" className={styles.emblemImg} />
              ) : (
                <span className={styles.emblemFallback} aria-hidden="true">{row.institution.acronym}</span>
              )}
            </div>

            <p className={styles.name} title={row.team.name}>{row.team.name}</p>

            <p className={styles.points}>
              <span className={styles.pointsLabel}>PTS</span>
              <span className={styles.pointsValue}>{row.points}</span>
            </p>
          </>
        )

        return (
          <li key={row.id} className={styles.item}>
            {to ? (
              <TransitionLink to={to} className={`${styles.card} ${styles.link}`}>{content}</TransitionLink>
            ) : (
              <div className={styles.card}>{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

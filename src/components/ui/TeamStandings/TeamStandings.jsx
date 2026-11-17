import { useState } from 'react'
import { TransitionLink } from '../../transition'
import { measureLogo } from '../../../utils/logoFit'
import styles from './TeamStandings.module.css'

// Caja del escudo: ancho de la imagen (110% de la card) y lado al que se normaliza lo visible
const IMG_SCALE = 1.1       // igual que `.emblemImg { width }` en el CSS
const FIT_SIZE = 1          // lado mayor visible del escudo, en anchos de card
const TOP_MARGIN = 0.03     // distancia del borde superior del escudo al del emblema, en anchos de card

/**
 * Escudo normalizado: mide la parte visible de la imagen y la escala/sube para que todos
 * tengan el mismo tamano y altura. Si no se puede medir, queda con el ajuste base del CSS.
 */
function EmblemImage({ src }) {
  const [style, setStyle] = useState(null)

  const handleLoad = (event) => {
    const box = measureLogo(event.currentTarget)
    if (!box) return

    const cx = (box.left + box.right) / 2
    const scale = Math.min(1.6, Math.max(0.6, FIT_SIZE / (IMG_SCALE * Math.max(box.right - box.left, box.bottom - box.top))))
    setStyle({
      transformOrigin: `${cx * 100}% ${box.top * 100}%`,
      transform: `translate(${-50 - (cx - 0.5) * 100}%, ${(TOP_MARGIN / IMG_SCALE - box.top) * 100}%) scale(${scale})`,
    })
  }

  return <img src={src} alt="" className={styles.emblemImg} style={style ?? undefined} onLoad={handleLoad} />
}

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
                <EmblemImage src={row.team.logo} />
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

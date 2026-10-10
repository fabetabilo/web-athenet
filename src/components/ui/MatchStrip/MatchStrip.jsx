import { TransitionLink } from '../../transition'
import Button from '../Button/Button'
import styles from './MatchStrip.module.css'

/**
 * Fila de un equipo dentro de la tarjeta de un encuentro.
 *
 * Devuelve un fragment a proposito: las tres celdas tienen que ser hijas directas de .teams para que las dos filas compartan las mismas columnas.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeMatch').MatchSide} props.side
 */
function TeamRow({ side }) {
  return (
    <>
      <span className={styles.crest}>
        {side.image && <img src={side.image} alt="" className={styles.crestImage} />}
      </span>
      <span className={styles.acronym}>{side.acronym}</span>
      <span className={styles.score}>{side.score ?? '-'}</span>
    </>
  )
}

/**
 * Barra de resultados de una competencia.
 * 
 * NOTA: CONSIDERAR con fecha 10-09-2026, este componente solo es capaz de renderizar competencias que requieran de un scoreboard
 * sencillo de dos digitos: 3 - 0, 4 - 1. No soporta scoreboards de tenis de mesa, tenis, u otras.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeMatch').NormalizedMatch[]} props.matches
 */
export default function MatchStrip({ matches = [] }) {
  if (matches.length === 0) return null
  // La barra muestra una competencia a la vez, asi que basta con la del primero.
  const competitionName = matches[0].competitionName

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          {competitionName && (
            <div className={styles.titleBar}>
              <span className={styles.title}>{competitionName}</span>
            </div>
          )}

          <div className={styles.bar}>
            <ul className={styles.track}>
              {matches.map((match) => {
                const relativeDay = match.isPlayed ? null : match.relativeDay
                const statusText = relativeDay ? match.relativeDayLabel : match.statusLabel
                const statusClassName = relativeDay
                  ? `${styles.status} ${styles.pill} ${relativeDay === 'TODAY' ? styles.pillToday : styles.pillTomorrow}`
                  : styles.status

                const label = [
                  `${match.phaseLabel} de ${match.categoryLabel}`,
                  match.isPlayed
                    ? `${match.one.acronym} ${match.one.score ?? '-'}, ${match.two.acronym} ${match.two.score ?? '-'}`
                    : `${match.one.acronym} contra ${match.two.acronym}`,
                  match.formattedTime && !match.isPlayed ? `${statusText} a las ${match.formattedTime}` : statusText,
                ].join('. ')

                return (
                  <li key={match.id} className={styles.item}>
                    <TransitionLink to="/results" className={styles.link} aria-label={label}>
                      <span className={styles.card}>
                        <span className={styles.headerTop}>
                          <span className={styles.phase}>{match.phaseLabel}</span>
                          <span className={statusClassName}>{statusText}</span>
                        </span>
                        {/* un encuentro jugado no muestra horario; la fila queda vacia pero debe reservar su alto */}
                        <span className={styles.headerBottom}>
                          {!match.isPlayed && (
                            <>
                              {match.formattedTime && <span className={styles.time}>{match.formattedTime}</span>}
                              <span className={styles.date}>{match.shortDate}</span>
                            </>
                          )}
                        </span>
                        <span className={styles.teams}>
                          <TeamRow side={match.one} />
                          <TeamRow side={match.two} />
                        </span>
                      </span>
                    </TransitionLink>
                  </li>
                )
              })}

              {/* El Button trae su propio skewX; .ctaInner evita que quede a -16deg. */}
              <li className={`${styles.item} ${styles.ctaCell}`}>
                <span className={styles.ctaInner}>
                  <Button to="/results" variant="dark" className={styles.ctaButton}>
                    Ver resultados
                  </Button>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { LuTrophy } from 'react-icons/lu'
import BracketMatch from './BracketMatch'
import { getWinner, groupByRound, initialRound } from './bracketUtils'
import styles from './Bracket.module.css'

/**
 * Llave de eliminacion directa: una columna por ronda; en pantallas chicas, una ronda a la vez.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeMatch').NormalizedMatch[]} props.matches
 * @param {string} [props.title]
 * @param {import('react').ReactNode} [props.aside] contenido a la derecha del titulo (ej. el deporte)
 */
export default function Bracket({ matches, title = 'Llaves', aside }) {
  const [selected, setSelected] = useState(null)
  const rounds = groupByRound(matches)
  if (rounds.length === 0) return null

  const active = selected ?? initialRound(rounds)
  const finalRound = rounds[rounds.length - 1]
  const champion = finalRound.phase === 'FINAL' ? getWinner(finalRound.matches[0]) : null

  return (
    <section className={styles.section} aria-labelledby="bracket-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="bracket-title" className={styles.title}>
            <LuTrophy className={styles.titleIcon} aria-hidden="true" />
            {title}
          </h2>
          {aside}
        </div>

        {/* selector de ronda: solo se ve en pantallas chicas */}
        <nav className={styles.tabs} aria-label="Rondas">
          {rounds.map((round) => (
            <button
              key={round.phase}
              type="button"
              aria-pressed={round.phase === active}
              className={`${styles.tab} ${round.phase === active ? styles.tabActive : ''}`}
              onClick={() => setSelected(round.phase)}
            >
              {round.label}
            </button>
          ))}
        </nav>

        <div className={styles.bracket} style={{ '--rounds': rounds.length }}>
          {rounds.map((round, roundIndex) => {
            const hasNext = roundIndex < rounds.length - 1
            const hasPrev = roundIndex > 0
            const roundClass = [
              styles.round,
              round.phase === active ? styles.roundActive : '',
              hasNext ? styles.hasNext : '',
              hasPrev ? styles.hasPrev : '',
            ].join(' ')

            return (
              <div key={round.phase} className={roundClass}>
                <h3 className={styles.roundTitle}>{round.label}</h3>
                <ol className={styles.slots}>
                  {round.matches.map((match, index) => (
                    <li key={match.id} className={`${styles.slot} ${index % 2 === 0 ? styles.slotUpper : styles.slotLower}`}>
                      <div className={styles.cardWrap}>
                        <BracketMatch match={match} />
                      </div>
                      {!hasNext && champion && (
                        <div className={styles.champion}>
                          <LuTrophy className={styles.trophy} aria-hidden="true" />
                          <span className={styles.championCrest}>
                            {champion.image && <img src={champion.image} alt="" className={styles.crestImage} />}
                          </span>
                          <span className={styles.championText}>
                            <span className={styles.championLabel}>Campeón</span>
                            <span className={styles.championName}>{champion.name ?? champion.acronym}</span>
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import styles from './Match.module.css'

const ROWS = [
  { key: 'possession', label: 'Posesión', suffix: '%' },
  { key: 'shotsOnTarget', label: 'Tiros al arco' },
  { key: 'shots', label: 'Tiros' },
  { key: 'passes', label: 'Pases' },
  { key: 'corners', label: 'Córners' },
  { key: 'fouls', label: 'Faltas' },
  { key: 'yellowCards', label: 'Tarjetas amarillas' },
  { key: 'redCards', label: 'Tarjetas rojas' },
]

/** Parte de la barra que corresponde al local; 50/50 mientras ambos esten en cero. */
const homeShare = ({ home, away }) => (home + away === 0 ? 50 : (home / (home + away)) * 100)

/**
 * Estadisticas comparadas: valor local, nombre, valor visitante y una barra proporcional.
 *
 * @param {{ stats: ReturnType<typeof import('../../service/liveMatch/matchEvents').createMatchState>['stats'] }} props
 */
export default function MatchStats({ stats }) {
  return (
    <div>
      <h2 className={styles.panelTitle}>Estadísticas del partido</h2>
      <ul className={styles.statsList}>
        {ROWS.map(({ key, label, suffix = '' }) => {
          const { home, away } = stats[key]
          const share = homeShare(stats[key])
          const empty = home + away === 0
          const homeLeads = home > away
          const awayLeads = away > home

          return (
            <li key={key} className={styles.statRow}>
              <span className={`${styles.statValue} ${homeLeads ? styles.statLead : ''}`}>{home}{suffix}</span>
              <span className={styles.statLabel}>{label}</span>
              <span className={`${styles.statValue} ${styles.statValueEnd} ${awayLeads ? styles.statLead : ''}`}>{away}{suffix}</span>
              <span className={styles.bar} aria-hidden="true">
                <span className={`${styles.barHome} ${empty ? styles.barEmpty : ''}`} style={{ width: `${share}%` }} />
                <span className={`${styles.barAway} ${empty ? styles.barEmpty : ''}`} style={{ width: `${100 - share}%` }} />
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

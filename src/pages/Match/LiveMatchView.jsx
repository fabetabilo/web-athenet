import { useState } from 'react'
import useLiveMatch from '../../service/liveMatch/useLiveMatch'
import { describeEntry } from '../../service/liveMatch/matchEvents'
import { LIVE_MOCK_MODE } from '../../service/liveMatch/matchStream'
import MatchHeader from './MatchHeader'
import MatchStats from './MatchStats'
import MatchTimeline from './MatchTimeline'
import styles from './Match.module.css'

// Foto del banner (public/img): estadio de noche, de Mario Klassen en Unsplash (licencia libre), 2400 px de ancho
const STADIUM_PHOTO = `${import.meta.env.BASE_URL}img/estadio-banner.jpg`

// El topico marcador no trae estadisticas: en modo real solo queda la cronologia
const TABS = [
  { id: 'stats', label: 'Estadísticas' },
  { id: 'timeline', label: 'Cronología' },
].filter((item) => LIVE_MOCK_MODE || item.id !== 'stats')

/**
 * Vista de un partido: banner con foto y marcador, y debajo pestañas de estadisticas y cronologia
 * alimentadas por el stream en vivo.
 *
 * @param {Object} props
 * @param {import('../../utils/normalizeMatch').NormalizedMatch} props.match
 * @param {import('react').ReactNode} [props.backLink] - Enlace de vuelta, dentro del banner
 */
export default function LiveMatchView({ match, backLink }) {
  const { state, connection, historyStatus } = useLiveMatch(match)
  const [tab, setTab] = useState(TABS[0].id)
  const lastEntry = state.timeline[state.timeline.length - 1]

  // un partido ya jugado muestra su historia guardada; sin ella, un aviso en vez de ceros
  let panel
  if (historyStatus === 'loading') {
    panel = <p className={styles.empty}>Cargando el detalle del partido…</p>
  } else if (historyStatus === 'missing') {
    panel = <p className={styles.empty}>Aún no hay detalle de este partido.</p>
  } else {
    panel = tab === 'stats' ? <MatchStats stats={state.stats} /> : <MatchTimeline timeline={state.timeline} />
  }

  // Flechas izquierda/derecha cambian de pestana, como en un tablist estandar
  const handleKeyDown = (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const index = TABS.findIndex((item) => item.id === tab)
    const next = TABS[(index + step + TABS.length) % TABS.length].id
    setTab(next)
    document.getElementById(`match-tab-${next}`)?.focus()
  }

  return (
    <>
      <section className={styles.hero} style={{ '--header-photo': `url(${STADIUM_PHOTO})` }}>
        <div className={styles.container}>
          {backLink}
          <MatchHeader state={state} connection={connection} match={match} />
        </div>
      </section>

      <div className={`${styles.container} ${styles.body}`}>
        <div className={styles.tabs} role="tablist" aria-label="Detalle del partido" onKeyDown={handleKeyDown}>
          {TABS.map((item) => (
            <button
              key={item.id}
              id={`match-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`match-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section
          id={`match-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`match-tab-${tab}`}
          className={styles.panel}
        >
          {panel}
        </section>

        {/* anuncia cada evento nuevo a lectores de pantalla */}
        <p className={styles.srOnly} aria-live="polite">{describeEntry(lastEntry, state)}</p>
      </div>
    </>
  )
}

import { MATCH_EVENT } from '../../service/liveMatch/matchEvents'
import MatchEventIcon from './MatchEventIcon'
import styles from './Match.module.css'

// Hitos del partido: ocupan todo el ancho, sin lado
const MARKERS = {
  [MATCH_EVENT.START]: 'Inicio del partido',
  [MATCH_EVENT.KICKOFF]: 'Inicio del partido',
  [MATCH_EVENT.HALFTIME]: 'Entretiempo',
  [MATCH_EVENT.SECOND_HALF]: 'Comienza el segundo tiempo',
  [MATCH_EVENT.FULLTIME]: 'Final del partido',
}

function EventBody({ entry }) {
  const isSubstitution = entry.type === MATCH_EVENT.SUBSTITUTION

  return (
    <span className={styles.eventBody}>
      <MatchEventIcon type={entry.type} />
      <span className={styles.eventText}>
        {entry.type === MATCH_EVENT.SCORE ? (
          <span className={styles.eventName}>Punto</span>
        ) : isSubstitution ? (
          <>
            <span className={styles.eventName}>{entry.playerIn}</span>
            <span className={styles.eventDetail}>Sale {entry.playerOut}</span>
          </>
        ) : (
          <>
            <span className={styles.eventName}>{entry.player}</span>
            {entry.type === MATCH_EVENT.GOAL && entry.assist && (
              <span className={styles.eventDetail}>Asist. {entry.assist}</span>
            )}
          </>
        )}
      </span>
    </span>
  )
}

/**
 * Cronologia del partido, lo ultimo arriba: local a la izquierda de la linea central, visitante a la derecha.
 *
 * @param {{ timeline: Array<Object> }} props
 */
export default function MatchTimeline({ timeline }) {
  if (timeline.length === 0) {
    return <p className={styles.empty}>Aún no hay eventos. Aparecerán aquí cuando comience el partido.</p>
  }

  return (
    <ol className={styles.timeline}>
      {[...timeline].reverse().map((entry) => {
        const marker = MARKERS[entry.type]
        if (marker) {
          return (
            <li key={entry.id} className={styles.marker}>
              <span>{marker}</span>
            </li>
          )
        }

        return (
          <li key={entry.id} className={styles.event}>
            <div className={`${styles.eventSide} ${styles.eventHome}`}>
              {entry.side === 'home' && <EventBody entry={entry} />}
            </div>
            <span className={styles.eventMinute}>{entry.score ?? `${entry.minute}'`}</span>
            <div className={`${styles.eventSide} ${styles.eventAway}`}>
              {entry.side === 'away' && <EventBody entry={entry} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

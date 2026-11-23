import { useState } from 'react'
import { MATCH_EVENT, MATCH_PHASE } from '../../service/liveMatch/matchEvents'
import { LIVE_MOCK_MODE } from '../../service/liveMatch/matchStream'
import { measureLogo } from '../../utils/logoFit'
import MatchEventIcon from './MatchEventIcon'
import styles from './Match.module.css'

const LIVE_PHASES = [MATCH_PHASE.LIVE, MATCH_PHASE.FIRST_HALF, MATCH_PHASE.HALFTIME, MATCH_PHASE.SECOND_HALF]

const CONNECTION_LABELS = {
  connecting: 'Conectando…',
  live: 'Conectado',
  reconnecting: 'Reconectando…',
}

// Goles y tarjetas listados bajo cada equipo
const HIGHLIGHTS = [MATCH_EVENT.GOAL, MATCH_EVENT.YELLOW_CARD, MATCH_EVENT.RED_CARD]

// Parte de la caja del escudo que ocupa lo visible del logo
const CREST_FILL = 0.86

/**
 * Escudo normalizado: mide la parte visible del logo (sin margenes transparentes) y lo escala y
 * centra para que todos ocupen lo mismo. Si no se puede medir, queda con el ajuste base del CSS.
 */
function CrestImage({ src }) {
  const [style, setStyle] = useState(null)

  const handleLoad = (event) => {
    const box = measureLogo(event.currentTarget)
    if (!box) return

    const cx = (box.left + box.right) / 2
    const cy = (box.top + box.bottom) / 2
    const scale = Math.min(1.5, Math.max(0.7, CREST_FILL / Math.max(box.right - box.left, box.bottom - box.top)))
    setStyle({
      transformOrigin: `${cx * 100}% ${cy * 100}%`,
      transform: `translate(${(0.5 - cx) * 100}%, ${(0.5 - cy) * 100}%) scale(${scale})`,
    })
  }

  return <img src={src} alt="" className={styles.crestImage} style={style ?? undefined} onLoad={handleLoad} />
}

function TeamBlock({ team, events }) {
  return (
    <div className={styles.team}>
      <span className={styles.crest}>
        {team.logo && <CrestImage src={team.logo} />}
      </span>
      <span className={styles.teamName}>{team.name}</span>
      {/* siempre presente: reserva espacio para que un gol o tarjeta nuevo no mueva la pagina */}
      <ul className={styles.teamEvents} aria-label={`Goles y tarjetas de ${team.name}`} aria-hidden={events.length === 0 || undefined}>
        {events.map((event) => (
          <li key={event.id} className={styles.teamEvent}>
            <MatchEventIcon type={event.type} />
            <span>{event.player} <span className={styles.teamEventMinute}>{event.minute}&apos;</span></span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Texto bajo el marcador: minuto en juego, entretiempo, final o la hora programada. */
function statusText(state, match) {
  switch (state.phase) {
    case MATCH_PHASE.LIVE:
      return 'En juego'
    case MATCH_PHASE.FIRST_HALF:
    case MATCH_PHASE.SECOND_HALF:
      return `${state.minute}'`
    case MATCH_PHASE.HALFTIME:
      return 'Entretiempo'
    case MATCH_PHASE.FINISHED:
      return 'Final'
    default:
      return [match.shortDate, match.formattedTime].filter(Boolean).join(' · ') || 'Programado'
  }
}

/**
 * Cabecera del partido: competencia, estado, marcador y equipos; un gol nuevo muestra una franja
 * con el goleador (animacion CSS, se remonta por la key del gol).
 *
 * @param {Object} props
 * @param {ReturnType<typeof import('../../service/liveMatch/matchEvents').createMatchState>} props.state
 * @param {string} props.connection
 * @param {import('../../utils/normalizeMatch').NormalizedMatch} props.match
 */
export default function MatchHeader({ state, connection, match }) {
  const isLive = LIVE_PHASES.includes(state.phase)
  const isFinished = state.phase === MATCH_PHASE.FINISHED
  const badge = isLive ? 'En vivo' : isFinished ? 'Finalizado' : 'Próximo'
  const goal = state.lastGoal
  const eventsOf = (side) => state.timeline.filter((entry) => entry.side === side && HIGHLIGHTS.includes(entry.type))

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <span className={styles.competition}>
          {match.competitionName}
          {match.phaseLabel && <span className={styles.competitionPhase}> · {match.phaseLabel}</span>}
        </span>
        <span className={`${styles.badge} ${isLive ? styles.badgeLive : ''}`}>
          {isLive && <span className={`${styles.dot} ${state.phase === MATCH_PHASE.HALFTIME ? styles.dotStill : ''}`} aria-hidden="true" />}
          {badge}
        </span>
      </div>

      <div className={styles.scoreRow}>
        <TeamBlock team={state.home} events={eventsOf('home')} />
        <div className={styles.center}>
          <p className={styles.score} aria-label={`Marcador: ${state.home.score} a ${state.away.score}`}>
            {/* la key remonta el numero y repite la animacion cuando cambia */}
            <span key={`h${state.home.score}`} className={styles.digit}>{state.home.score}</span>
            <span className={styles.colon} aria-hidden="true">:</span>
            <span key={`a${state.away.score}`} className={styles.digit}>{state.away.score}</span>
          </p>
          <span className={`${styles.statusPill} ${isLive && state.phase !== MATCH_PHASE.HALFTIME ? styles.statusLive : ''}`}>
            {statusText(state, match)}
          </span>
        </div>
        <TeamBlock team={state.away} events={eventsOf('away')} />
      </div>

      {!isFinished && (
        <p className={styles.meta}>
          <span className={`${styles.metaDot} ${connection === 'live' ? styles.metaDotOn : ''}`} aria-hidden="true" />
          {CONNECTION_LABELS[connection] ?? ''}
          {LIVE_MOCK_MODE && <span className={styles.metaMock}> · Datos simulados</span>}
        </p>
      )}

      {goal && (
        <p key={goal.id} className={styles.goalBanner} aria-hidden="true">
          ¡Gol! {goal.player ? `${goal.player} · ` : ''}{state[goal.side].acronym} {goal.minute}&apos;
        </p>
      )}
    </header>
  )
}

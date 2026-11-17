import { TransitionLink } from '../../transition'
import { getWinner } from './bracketUtils'
import styles from './Bracket.module.css'

function TeamRow({ side, state }) {
  const stateClass = state === 'winner' ? styles.rowWinner : state === 'loser' ? styles.rowLoser : ''

  return (
    <span className={`${styles.row} ${stateClass}`}>
      <span className={styles.crest}>
        {side.image && <img src={side.image} alt="" className={styles.crestImage} />}
      </span>
      <span className={styles.name}>{side.isDefined ? side.name ?? side.acronym : 'Por definir'}</span>
      <span className={styles.score}>{side.score ?? '–'}</span>
    </span>
  )
}

/** Texto de estado de la tarjeta: en vivo, finalizado, fecha y hora, o por definir. */
function statusOf(match) {
  if (match.isLive) return 'En vivo'
  if (match.isPlayed) return 'Finalizado'
  if (match.isPending) return 'Por definir'
  return [match.relativeDayLabel ?? match.shortDate, match.formattedTime].filter(Boolean).join(' · ') || 'Programado'
}

/**
 * Tarjeta de partido de la llave; link a su pagina salvo que algun lado este por definir.
 *
 * @param {{ match: import('../../../utils/normalizeMatch').NormalizedMatch }} props
 */
export default function BracketMatch({ match }) {
  const winner = getWinner(match)
  const stateOf = (side) => (winner ? (winner === side ? 'winner' : 'loser') : '')
  const className = `${styles.card} ${match.isLive ? styles.cardLive : ''}`
  const content = (
    <>
      <span className={`${styles.status} ${match.isLive ? styles.statusLive : ''}`}>{statusOf(match)}</span>
      <TeamRow side={match.one} state={stateOf(match.one)} />
      <TeamRow side={match.two} state={stateOf(match.two)} />
    </>
  )

  if (match.isPending) return <div className={className}>{content}</div>

  return (
    <TransitionLink
      to={`/partidos/${match.id}`}
      className={className}
      aria-label={`${match.one.name ?? match.one.acronym} contra ${match.two.name ?? match.two.acronym}. ${statusOf(match)}`}
    >
      {content}
    </TransitionLink>
  )
}

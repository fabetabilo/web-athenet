import { FaFutbol } from 'react-icons/fa6'
import { LuArrowLeftRight } from 'react-icons/lu'
import { MATCH_EVENT } from '../../service/liveMatch/matchEvents'
import styles from './Match.module.css'

/** Icono de un evento: balon para gol, tarjeta amarilla o roja, y flechas para un cambio. */
export default function MatchEventIcon({ type }) {
  if (type === MATCH_EVENT.GOAL || type === MATCH_EVENT.SCORE) return <FaFutbol className={styles.iconGoal} aria-hidden="true" />
  if (type === MATCH_EVENT.YELLOW_CARD) return <span className={`${styles.card} ${styles.cardYellow}`} aria-hidden="true" />
  if (type === MATCH_EVENT.RED_CARD) return <span className={`${styles.card} ${styles.cardRed}`} aria-hidden="true" />
  return <LuArrowLeftRight className={styles.iconSwap} aria-hidden="true" />
}

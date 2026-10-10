import { TransitionLink } from '../../transition'
import { ArrowRight } from '../../icons'
import styles from './TeamChip.module.css'

/**
 * Badge clickeable de un equipo: logo, nombre y flecha.
 * Enlaza al perfil del equipo.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeEvent').TeamRef} props.team - equipo resuelto
 */
export default function TeamChip({ team }) {
  return (
    <TransitionLink to={`/teams/${team.id}`} className={styles.chip}>
      <span className={styles.avatar}>
        <img src={team.logo} alt="" className={styles.logo} />
      </span>
      <span className={styles.name}>{team.name ?? team.acronym}</span>
      <ArrowRight className={styles.arrow} aria-hidden="true" />
    </TransitionLink>
  )
}

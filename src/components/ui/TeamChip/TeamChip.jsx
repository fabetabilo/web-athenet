import { TransitionLink } from '../../transition'
import { ArrowRight } from '../../icons'
import { getTeamData } from '../../../data/teamsMock'
import styles from './TeamChip.module.css'

/**
 * Badge clickeable de un equipo: logo, nombre y flecha.
 * Enlaza al perfil del equipo.
 *
 * @param {Object} props
 * @param {number|string} props.teamId - id del equipo
 */
export default function TeamChip({ teamId }) {
  const team = getTeamData(teamId)

  return (
    <TransitionLink to={`/teams/${teamId}`} className={styles.chip}>
      <span className={styles.avatar}>
        <img src={team.logo} alt="" className={styles.logo} />
      </span>
      <span className={styles.name}>{team.name}</span>
      <ArrowRight className={styles.arrow} aria-hidden="true" />
    </TransitionLink>
  )
}

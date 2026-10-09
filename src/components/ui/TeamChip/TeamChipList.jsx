import TeamChip from './TeamChip'
import styles from './TeamChip.module.css'

/**
 * Fila de badges de los equipos de un evento.
 * No renderiza nada si el evento no tiene equipos asociados.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeEvent').NormalizedEvent} props.event - evento normalizado
 */
export default function TeamChipList({ event }) {
  // hasTeams exige ambos ids; filtrar tolera tambien un evento con uno solo.
  const teamIds = [event?.teamOneId, event?.teamTwoId].filter((id) => id != null)
  if (teamIds.length === 0) return null

  return (
    <ul className={styles.list}>
      {teamIds.map((id) => (
        <li key={id}>
          <TeamChip teamId={id} />
        </li>
      ))}
    </ul>
  )
}

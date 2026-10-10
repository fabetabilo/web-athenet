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
  // hasTeams exige ambos equipos; filtrar tolera tambien un evento con uno solo.
  const teams = [event?.teamOne, event?.teamTwo].filter(Boolean)
  if (teams.length === 0) return null

  return (
    <ul className={styles.list}>
      {teams.map((team) => (
        <li key={team.id}>
          <TeamChip team={team} />
        </li>
      ))}
    </ul>
  )
}

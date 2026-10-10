import styles from './TeamChip.module.css'

/**
 * Un lado del encuentro: escudo y sigla del equipo.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeEvent').TeamRef} props.team - equipo resuelto
 */
function Side({ team }) {
  return (
    <span className={styles.side}>
      <span className={styles.avatar}>
        <img src={team.logo} alt="" className={styles.logo} />
      </span>
      <span className={styles.acronym}>{team.acronym}</span>
    </span>
  )
}

/**
 * Encuentro entre los equipos de un evento, por sigla y sin enlace.
 * Pensado para ir dentro de una fila ya clickeable, donde un TeamChip anidaria
 * un link dentro de otro destino.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeEvent').NormalizedEvent} props.event - evento normalizado
 */
export default function TeamMatchup({ event }) {
  // hasTeams exige ambos equipos; filtrar tolera tambien un evento con uno solo.
  const [one, two] = [event?.teamOne, event?.teamTwo].filter(Boolean)
  if (!one) return null

  return (
    <span className={`${styles.matchup} ${styles.matchupLight}`}>
      <Side team={one} />
      {two && (
        <>
          <span className={styles.versus}>VS</span>
          <Side team={two} />
        </>
      )}
    </span>
  )
}

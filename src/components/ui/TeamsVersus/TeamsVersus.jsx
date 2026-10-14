import styles from './TeamsVersus.module.css';

function TeamLogo({ team }) {
  if (team.logo) {
    return <img src={team.logo} alt={`Logo de ${team.name}`} className={styles.teamLogo} />;
  }
  return <span className={styles.teamLogoFallback} aria-hidden="true">{team.acronym}</span>;
}

/**
 * TeamsVersus
 *
 * Componente que muestra el enfrentamiento entre dos equipos en un evento.
 * Recibe el evento completo y decide si debe renderizarse (solo cuando hasTeams === true).
 *
 * @param {Object} props
 * @param {Object} props.event - Objeto del evento normalizado
 */
export default function TeamsVersus({ event }) {
  // Solo renderiza si tiene equipos
  if (!event || !event.hasTeams || !event.teamOne || !event.teamTwo) {
    return null;
  }

  const { teamOne, teamTwo } = event;

  return (
    <div className={styles.versusContainer}>
      <div className={styles.versusContent}>
        <div className={styles.teamSide}>
          <TeamLogo team={teamOne} />
          <h3 className={styles.teamName}>{teamOne.name}</h3>
          {teamOne.institution && <p className={styles.teamInstitution}>{teamOne.institution}</p>}
        </div>

        <div className={styles.matchInfo}>
          <span className={styles.matchRound}>Fecha #5</span>
          <h2 className={styles.matchDate}>SAB, 15 OCT 20:45</h2>
          <span className={styles.matchCompetition}>COMPETENCIA</span>
        </div>

        <div className={styles.teamSide}>
          <TeamLogo team={teamTwo} />
          <h3 className={styles.teamName}>{teamTwo.name}</h3>
          {teamTwo.institution && <p className={styles.teamInstitution}>{teamTwo.institution}</p>}
        </div>
      </div>
    </div>
  );
}

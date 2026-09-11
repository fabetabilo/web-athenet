import React from 'react';
import styles from './TeamsVersus.module.css';
import { getTeamData } from '../../../data/teamsMock';

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
  if (!event || !event.hasTeams || event.teamOneId == null || event.teamTwoId == null) {
    return null;
  }

  const teamOne = getTeamData(event.teamOneId);
  const teamTwo = getTeamData(event.teamTwoId);

  return (
    <div className={styles.versusContainer}>
      <div className={styles.versusContent}>
        <div className={styles.teamSide}>
          <img src={teamOne.logo} alt={`Logo de ${teamOne.name}`} className={styles.teamLogo} />
          <h3 className={styles.teamName}>{teamOne.name}</h3>
          {teamOne.institution && <p className={styles.teamInstitution}>{teamOne.institution}</p>}
        </div>

        <div className={styles.matchInfo}>
          <span className={styles.matchRound}>Fecha #5</span>
          <h2 className={styles.matchDate}>SAB, 15 OCT 20:45</h2>
          <span className={styles.matchCompetition}>COMPETENCIA</span>
        </div>

        <div className={styles.teamSide}>
          <img src={teamTwo.logo} alt={`Logo de ${teamTwo.name}`} className={styles.teamLogo} />
          <h3 className={styles.teamName}>{teamTwo.name}</h3>
          {teamTwo.institution && <p className={styles.teamInstitution}>{teamTwo.institution}</p>}
        </div>
      </div>
    </div>
  );
}

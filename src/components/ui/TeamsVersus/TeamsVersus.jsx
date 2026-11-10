import { parseLocalDateTime } from '../../../utils/dateTime';
import TeamCard from '../TeamCard/TeamCard';
import styles from './TeamsVersus.module.css';

function formatKickoff(eventDate, startTime) {
  const date = parseLocalDateTime(eventDate)
    .toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '');
  return startTime ? `${date} ${startTime}` : date;
}

/**
 * TeamsVersus
 *
 * Componente que muestra el enfrentamiento entre dos equipos en un evento.
 * Recibe el evento completo y decide si debe renderizarse (solo cuando hasTeams === true).
 * Con el partido de ms-competitions suma la ronda, la competencia y el marcador.
 *
 * @param {Object} props
 * @param {Object} props.event - Objeto del evento normalizado
 * @param {import('../../../utils/normalizeMatch').NormalizedMatch|null} [props.match] - Partido que el evento copia
 */
export default function TeamsVersus({ event, match = null }) {
  if (!event || !event.hasTeams || !event.teamOne || !event.teamTwo) {
    return null;
  }

  const { teamOne, teamTwo } = event;
  const sides = match ? [match.one, match.two] : [];
  const scoreOf = (team) => sides.find((side) => String(side.teamId) === String(team.id))?.score ?? null;
  const scoreOne = scoreOf(teamOne);
  const scoreTwo = scoreOf(teamTwo);
  const hasScore = scoreOne !== null && scoreTwo !== null;

  return (
    <section className={styles.versus}>
      <div className={styles.content}>
        <div className={styles.sideOne}>
          <TeamCard team={teamOne} />
        </div>

        <div className={styles.matchInfo}>
          {match && <span className={styles.matchRound}>{match.phaseLabel}</span>}
          <h2 className={styles.matchCenter}>{formatKickoff(event.eventDate, event.startTime)}</h2>
          {match?.competitionName && (
            <span className={styles.matchCompetition}>{match.competitionName}</span>
          )}
          {hasScore && (
            <p className={styles.result}>
              <span className={styles.resultScore}>{scoreOne} - {scoreTwo}</span>
              <span className={styles.resultStatus}>{match.statusLabel}</span>
            </p>
          )}
        </div>

        <div className={styles.sideTwo}>
          <TeamCard team={teamTwo} />
        </div>
      </div>
    </section>
  );
}

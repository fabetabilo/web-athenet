/**
 * TeamsVersus
 *
 * Componente que muestra el enfrentamiento entre dos equipos en un evento.
 * Se renderiza en EventDetail solo cuando event.hasTeams === true.
 *
 * Decisión de negocio:
 *   - type=MATCH garantiza hasTeams=true (invariante de backend).
 *   - Otros tipos de evento (MEETING, TRACKDAY, OTHER) también pueden tener
 *     equipos — la condición de render es siempre `hasTeams`, no `type`.
 *
 * TODO: Diseño visual e integración con endpoint de equipos pendiente.
 *   - teamOneId y teamTwoId son IDs numéricos; para resolver nombre/logo
 *     se requiere un endpoint de equipos (pendiente de backend, hueco #7).
 *
 * @param {Object} props
 * @param {number} props.teamOneId - ID del primer equipo (local)
 * @param {number} props.teamTwoId - ID del segundo equipo (visitante)
 */
export default function TeamsVersus({ teamOneId, teamTwoId }) {
  // todo: diseño visual e integración pendiente
  return null
}

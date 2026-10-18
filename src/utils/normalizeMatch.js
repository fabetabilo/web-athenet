/**
 * normalizeMatch
 *
 * Convierte un partido crudo de ms-competitions en el shape canonico del front.
 * Misma regla que normalizeEvent: ningun componente consume el crudo.
 */

import { formatEventDate } from './normalizeEvent'

// ---------------------------------------------------------------------------
// Tablas de mapeo
/**
 * Rondas de la llave. La copa es de 16 equipos, asi que arranca en octavos:
 * 16avos (ROUND_OF_32) quedo deprecado.
 * @type {Record<string, string>}
 */
const PHASE_LABELS = {
  ROUND_OF_16:   'Octavos',
  QUARTER_FINAL: 'Cuartos',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
}

/** @type {Record<string, string>} */
const MATCH_STATUS_LABELS = {
  SCHEDULED:   'Programado',
  IN_PROGRESS: 'En juego',
  FINISHED:    'Finalizado',
}

/** @type {Record<string, string>} */
const RELATIVE_DAY_LABELS = {
  TODAY:    'Hoy',
  TOMORROW: 'Mañana',
}

/** Nombres de mes abreviados, indice 0 = enero. */
const SHORT_MONTH_NAMES_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

// ---------------------------------------------------------------------------
/**
 * Posicion del partido respecto de hoy: 'TODAY', 'TOMORROW' o null.
 * Compara a medianoche local para no depender de la hora, y redondea el diff
 * porque un cambio de horario de verano rompe el multiplo exacto de 24h.
 *
 * @param {string|null} isoDate - Fecha en formato "YYYY-MM-DD"
 * @returns {string|null}
 */
function getRelativeDay(isoDate) {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target - today) / 86400000)
  if (diffDays === 0) return 'TODAY'
  if (diffDays === 1) return 'TOMORROW'
  return null
}

/**
 * Hora de inicio en HH:mm. Acepta "19:30" y el "19:30:00" de una columna TIME.
 * No usa Date a proposito: construirlo exigiria una fecha y reintroduciria el
 * desfase de timezone que formatEventDate evita.
 *
 * @param {string|null|undefined} matchTime
 * @returns {string|null}
 */
function formatMatchTime(matchTime) {
  if (!matchTime) return null
  const [hours, minutes] = matchTime.split(':')
  if (!hours || !minutes) return null
  return `${hours.padStart(2, '0')}:${minutes}`
}

/**
 * Fecha corta "9 oct" para la cabecera de la tarjeta: el formato largo de
 * formatEventDate ("9 de octubre de 2026") no entra en su ancho fijo.
 *
 * @param {string|null} isoDate - Fecha en formato "YYYY-MM-DD"
 * @returns {string|null}
 */
function formatShortMatchDate(isoDate) {
  if (!isoDate) return null
  const [, month, day] = isoDate.split('-').map(Number)
  return `${day} ${SHORT_MONTH_NAMES_ES[month - 1]}`
}

/** Lado que la ronda anterior todavia no define. */
const UNDEFINED_SIDE = {
  teamId: null,
  institutionId: null,
  name: null,
  acronym: '—',
  image: null,
  score: null,
  isDefined: false,
}

/** Institucion que el llamador no supo resolver. */
const NO_INSTITUTION = { acronym: '—', image: null }

/**
 * Arma un lado del marcador. Sigla y escudo prefieren lo que mande el backend
 * y caen a lo que resuelva el llamador: el dia que un BFF los mande inline,
 * se deja de inyectar resolve y esto sigue correcto.
 *
 * @param {Object|null} rawSide
 * @param {(id: number) => { acronym: string, image: string|null }} resolve
 * @returns {MatchSide}
 */
function normalizeSide(rawSide, resolve) {
  if (!rawSide) return { ...UNDEFINED_SIDE }

  const resolved = rawSide.institutionId != null ? resolve(rawSide.institutionId) : NO_INSTITUTION
  return {
    teamId:        rawSide.teamId ?? null,
    institutionId: rawSide.institutionId ?? null,
    name:          rawSide.name ?? null,
    acronym:       rawSide.acronym ?? resolved.acronym,
    image:         rawSide.logoUrl ?? resolved.image,
    score:         rawSide.score ?? null,
    isDefined:     true,
  }
}

/**
 * @typedef {Object} MatchSide
 * @property {number|null} teamId
 * @property {number|null} institutionId
 * @property {string|null} name          - nombre del equipo inscrito
 * @property {string}      acronym       - sigla del backend o la resuelta por el llamador
 * @property {string|null} image         - URL del escudo; null si no hay
 * @property {number|null} score         - null hasta que el delegado carga el resultado
 * @property {boolean}     isDefined     - false mientras la ronda anterior no da el equipo
 */

/**
 * @typedef {Object} NormalizedMatch
 * @property {number}  id
 * @property {number}  competitionId
 * @property {string}  competitionName
 * @property {string}  season
 * @property {number}  sportId
 * @property {string}  phase           - enum original: ROUND_OF_16 | QUARTER_FINAL | SEMI_FINAL | FINAL
 * @property {string}  phaseLabel      - label legible en español
 * @property {number}  position        - 1..N dentro de la ronda
 * @property {string|null} matchDate      - ISO "YYYY-MM-DD"; null si el director no la programo
 * @property {string|null} formattedDate  - fecha en es-CL, timezone-safe
 * @property {string|null} shortDate      - fecha corta "9 oct" para la cabecera de la tarjeta
 * @property {string|null} matchTime      - hora cruda "HH:mm" del recinto
 * @property {string|null} formattedTime  - hora en HH:mm, null si el crudo no la trae
 * @property {string|null} location
 * @property {string}  status          - SCHEDULED | IN_PROGRESS | FINISHED
 * @property {string}  statusLabel
 * @property {boolean} isPlayed        - true solo si status === 'FINISHED'
 * @property {boolean} isLive          - true solo si status === 'IN_PROGRESS'
 * @property {boolean} isPending       - true si la llave todavia no define algun lado
 * @property {string|null} relativeDay      - 'TODAY' | 'TOMORROW' | null (hecho de
 *                                            calendario, no decide el render)
 * @property {string|null} relativeDayLabel - label legible, null fuera de hoy/mañana
 * @property {MatchSide} one
 * @property {MatchSide} two
 */

/**
 * @param {Object} rawMatch
 * @param {(id: number) => { acronym: string, image: string|null }} [resolve]
 *        Resuelve sigla y escudo por id de institucion. Se inyecta para que este
 *        modulo no dependa del servicio de instituciones.
 * @returns {NormalizedMatch}
 */
export function normalizeMatch(rawMatch, resolve = () => NO_INSTITUTION) {
  const competition = rawMatch.competition ?? {}
  const matchDate = rawMatch.date ?? null
  const relativeDay = getRelativeDay(matchDate)

  const one = normalizeSide(rawMatch.home, resolve)
  const two = normalizeSide(rawMatch.away, resolve)

  return {
    id: rawMatch.id,
    competitionId:   competition.id,
    competitionName: competition.name,
    season:          competition.season,
    sportId:         competition.sportId,
    phase:      rawMatch.round,
    phaseLabel: PHASE_LABELS[rawMatch.round] ?? rawMatch.round,
    position:   rawMatch.position,
    matchDate,
    formattedDate: matchDate ? formatEventDate(matchDate) : null,
    shortDate:     formatShortMatchDate(matchDate),
    matchTime:     rawMatch.time ?? null,
    formattedTime: formatMatchTime(rawMatch.time),
    location:      rawMatch.location ?? null,
    status:      rawMatch.status,
    statusLabel: MATCH_STATUS_LABELS[rawMatch.status] ?? rawMatch.status,
    isPlayed:    rawMatch.status === 'FINISHED',
    isLive:      rawMatch.status === 'IN_PROGRESS',
    isPending:   !one.isDefined || !two.isDefined,
    relativeDay,
    relativeDayLabel: relativeDay ? RELATIVE_DAY_LABELS[relativeDay] : null,
    one,
    two,
  }
}

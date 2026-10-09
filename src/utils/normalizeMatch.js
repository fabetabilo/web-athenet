/**
 * normalizeMatch
 *
 * Convierte un payload crudo de encuentro en el shape canonico del front.
 * Misma regla que normalizeEvent: ningun componente consume el crudo.
 */

import { CATEGORY_LABELS, formatEventDate } from './normalizeEvent'
import { getInstitutionAcronym, getInstitutionImage } from '../data/institutions'

// ---------------------------------------------------------------------------
// Tablas de mapeo
/**
 * Fases de un cuadro eliminatorio.
 * Nomenclatura chilena: dieciseisavos = llave de 32, octavos = llave de 16.
 * @type {Record<string, string>}
 */
const PHASE_LABELS = {
  ROUND_OF_32: '16avos',
  ROUND_OF_16: 'Octavos',
  ROUND_OF_8:  'Cuartos',
  SEMI_FINAL:  'Semifinal',
  FINAL:       'Final',
}

/** @type {Record<string, string>} */
const MATCH_STATUS_LABELS = {
  SCHEDULED: 'Programado',
  FINISHED:  'Finalizado',
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
 * Posicion del encuentro respecto de hoy: 'TODAY', 'TOMORROW' o null.
 * Compara a medianoche local para no depender de la hora, y redondea el diff
 * porque un cambio de horario de verano rompe el multiplo exacto de 24h.
 *
 * @param {string} isoDate - Fecha en formato "YYYY-MM-DD"
 * @returns {string|null}
 */
function getRelativeDay(isoDate) {
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
 * @param {string} isoDate - Fecha en formato "YYYY-MM-DD"
 * @returns {string}
 */
function formatShortMatchDate(isoDate) {
  const [, month, day] = isoDate.split('-').map(Number)
  return `${day} ${SHORT_MONTH_NAMES_ES[month - 1]}`
}

/**
 * Arma un lado del marcador. La sigla y el escudo prefieren lo que mande el
 * backend y caen al mock local mientras ms-competitions no exista.
 */
function normalizeSide(institutionId, acronym, score, image) {
  return {
    institutionId: institutionId ?? null,
    acronym: acronym ?? getInstitutionAcronym(institutionId),
    image: image ?? getInstitutionImage(institutionId),
    score: score ?? null,
  }
}

/**
 * @typedef {Object} MatchSide
 * @property {number|null} institutionId
 * @property {string}      acronym       - sigla del backend o del mock local
 * @property {string|null} image         - URL del escudo; null si no hay
 * @property {number|null} score         - null mientras el encuentro no se juega
 */

/**
 * @typedef {Object} NormalizedMatch
 * @property {string}  id              - internalId del backend
 * @property {number}  competitionId
 * @property {string}  competitionName
 * @property {string}  phase           - enum original: ROUND_OF_32 | ... | FINAL
 * @property {string}  phaseLabel      - label legible en español
 * @property {string}  category        - enum original compartido con eventos
 * @property {string}  categoryLabel
 * @property {string}  matchDate       - ISO "YYYY-MM-DD"
 * @property {string}  formattedDate   - fecha en es-CL, timezone-safe
 * @property {string}  shortDate       - fecha corta "9 oct" para la cabecera de la tarjeta
 * @property {string|null} matchTime    - hora cruda "HH:mm" del recinto
 * @property {string|null} formattedTime - hora en HH:mm, null si el crudo no la trae
 * @property {string}  status          - SCHEDULED | FINISHED
 * @property {string}  statusLabel
 * @property {boolean} isPlayed        - true solo si status === 'FINISHED'
 * @property {string|null} relativeDay      - 'TODAY' | 'TOMORROW' | null (hecho de
 *                                            calendario, no decide el render)
 * @property {string|null} relativeDayLabel - label legible, null fuera de hoy/mañana
 * @property {MatchSide} one
 * @property {MatchSide} two
 */

/**
 * @param {Object} rawMatch
 * @returns {NormalizedMatch}
 */
export function normalizeMatch(rawMatch) {
  const relativeDay = getRelativeDay(rawMatch.matchDate)

  return {
    id: rawMatch.internalId,
    competitionId:   rawMatch.competitionId,
    competitionName: rawMatch.competitionName,
    phase:      rawMatch.phase,
    phaseLabel: PHASE_LABELS[rawMatch.phase] ?? rawMatch.phase,
    category:      rawMatch.category,
    categoryLabel: CATEGORY_LABELS[rawMatch.category] ?? rawMatch.category,
    matchDate:     rawMatch.matchDate,
    formattedDate: formatEventDate(rawMatch.matchDate),
    shortDate:     formatShortMatchDate(rawMatch.matchDate),
    matchTime:     rawMatch.matchTime ?? null,
    formattedTime: formatMatchTime(rawMatch.matchTime),
    status:      rawMatch.status,
    statusLabel: MATCH_STATUS_LABELS[rawMatch.status] ?? rawMatch.status,
    isPlayed:    rawMatch.status === 'FINISHED',
    relativeDay,
    relativeDayLabel: relativeDay ? RELATIVE_DAY_LABELS[relativeDay] : null,
    one: normalizeSide(rawMatch.institutionOneId, rawMatch.institutionOneAcronym, rawMatch.scoreOne, rawMatch.institutionOneImage),
    two: normalizeSide(rawMatch.institutionTwoId, rawMatch.institutionTwoAcronym, rawMatch.scoreTwo, rawMatch.institutionTwoImage),
  }
}

// ---------------------------------------------------------------------------
/**
 * Orden de presentacion para la barra de resultados: primero lo que aun no se
 * juega (hoy a la izquierda, luego los proximos), despues lo finalizado del
 * mas reciente al mas viejo.
 *
 * matchDate es ISO "YYYY-MM-DD", asi que comparar como string ya es cronologico.
 * Devuelve un array nuevo: el mock es un const de modulo reusado entre llamadas,
 * ordenarlo in place lo corromperia.
 *
 * @param {NormalizedMatch[]} matches
 * @returns {NormalizedMatch[]}
 */
export function sortForStrip(matches) {
  return [...matches].sort((a, b) => {
    if (a.isPlayed !== b.isPlayed) return a.isPlayed ? 1 : -1
    return a.isPlayed
      ? b.matchDate.localeCompare(a.matchDate)   // jugados: el mas reciente primero
      : a.matchDate.localeCompare(b.matchDate)   // pendientes: el mas proximo primero
  })
}

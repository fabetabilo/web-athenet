/**
 * @file matchEvents.js
 * Contrato de los eventos de un partido en vivo y su reductor.
 *
 * Cada mensaje del stream (Kafka -> servicio que lo reenvia -> navegador) es un JSON:
 *   { matchId, id, type, minute, ...datos }
 *
 *   KICKOFF       -
 *   CLOCK         { minute }
 *   GOAL          { minute, side, player, assist? }          side = equipo que suma el gol
 *   YELLOW_CARD   { minute, side, player }
 *   RED_CARD      { minute, side, player }
 *   SUBSTITUTION  { minute, side, playerIn, playerOut }
 *   HALFTIME      { minute }
 *   SECOND_HALF   { minute }
 *   FULLTIME      { minute }
 *   STATS         { stats: { possession: { home, away }, shots: { home, away }, ... } }
 *
 * El modo real (tópico marcador, sin reloj) solo usa:
 *   START         -
 *   SCORE         { home, away }                            marcador absoluto
 *   FULLTIME      -
 *
 * `side` es 'home' | 'away'. `id` es unico por evento: el reductor ignora los repetidos (reconexion).
 * La historia de un partido jugado es la lista de estos eventos, de KICKOFF a FULLTIME (ver loadMatchHistory).
 */

export const MATCH_EVENT = Object.freeze({
  START: 'START',
  SCORE: 'SCORE',
  KICKOFF: 'KICKOFF',
  CLOCK: 'CLOCK',
  GOAL: 'GOAL',
  YELLOW_CARD: 'YELLOW_CARD',
  RED_CARD: 'RED_CARD',
  SUBSTITUTION: 'SUBSTITUTION',
  HALFTIME: 'HALFTIME',
  SECOND_HALF: 'SECOND_HALF',
  FULLTIME: 'FULLTIME',
  STATS: 'STATS',
})

export const MATCH_PHASE = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  FIRST_HALF: 'FIRST_HALF',
  HALFTIME: 'HALFTIME',
  SECOND_HALF: 'SECOND_HALF',
  FINISHED: 'FINISHED',
})

/** Estadisticas que manda el stream en STATS; las tarjetas se cuentan solas desde los eventos. */
const SNAPSHOT_STATS = ['possession', 'shotsOnTarget', 'shots', 'passes', 'corners', 'fouls']

const pair = (home = 0, away = 0) => ({ home, away })

const emptyStats = () => ({
  possession: pair(50, 50),
  shotsOnTarget: pair(),
  shots: pair(),
  passes: pair(),
  corners: pair(),
  fouls: pair(),
  yellowCards: pair(),
  redCards: pair(),
})

const toTeam = (side) => ({
  name: side.name ?? side.acronym,
  acronym: side.acronym,
  logo: side.image,
  score: side.score ?? 0,
})

/**
 * Estado inicial del partido normalizado; uno ya jugado parte terminado, con el marcador del fixture.
 *
 * @param {import('../../utils/normalizeMatch').NormalizedMatch} match
 */
export function createMatchState(match) {
  return {
    matchId: match.id,
    phase: match.isPlayed ? MATCH_PHASE.FINISHED : MATCH_PHASE.SCHEDULED,
    minute: match.isPlayed ? 90 : 0,
    home: toTeam(match.one),
    away: toTeam(match.two),
    stats: emptyStats(),
    timeline: [],      // cronologico; la vista lo invierte
    lastGoal: null,    // dispara la animacion de gol
  }
}

const entryId = (event) => event.id ?? `${event.type}-${event.minute}`

/** Agrega el evento a la cronologia (no incluye CLOCK ni STATS). */
const withEntry = (state, event, extra = {}) => ({
  ...state,
  timeline: [
    ...state.timeline,
    {
      id: entryId(event),
      type: event.type,
      minute: event.minute,
      side: event.side ?? null,
      player: event.player ?? null,
      assist: event.assist ?? null,
      playerIn: event.playerIn ?? null,
      playerOut: event.playerOut ?? null,
      score: event.score ?? null,
    },
  ],
  ...extra,
})

const bump = (stats, key, side) => ({
  ...stats,
  [key]: { ...stats[key], [side]: stats[key][side] + 1 },
})

const isScore = (value) => Number.isInteger(value) && value >= 0

/** Puntos del lado que anoto, segun el parcial 'local-visita' de la entrada. */
const pointsOf = (entry) => Number(entry.score.split('-')[entry.side === 'home' ? 0 : 1])

/**
 * Fija el marcador absoluto. Agrega una entrada solo cuando sube un unico lado; una correccion
 * a la baja quita de la cronologia los puntos que ya no cuentan.
 */
function applyScore(state, { home, away }) {
  if (!isScore(home) || !isScore(away) || state.phase === MATCH_PHASE.FINISHED) return state
  if (home === state.home.score && away === state.away.score) return state

  const score = { home, away }
  const next = {
    ...state,
    phase: state.phase === MATCH_PHASE.SCHEDULED ? MATCH_PHASE.LIVE : state.phase,
    home: { ...state.home, score: home },
    away: { ...state.away, score: away },
    timeline: state.timeline.filter((entry) => entry.type !== MATCH_EVENT.SCORE || pointsOf(entry) <= score[entry.side]),
  }
  const homeUp = home > state.home.score && away === state.away.score
  const awayUp = away > state.away.score && home === state.home.score
  if (!homeUp && !awayUp) return next

  const side = homeUp ? 'home' : 'away'
  return withEntry(next, {
    id: `${MATCH_EVENT.SCORE}-${side}-${score[side]}`,
    type: MATCH_EVENT.SCORE,
    side,
    score: `${home}-${away}`,
  })
}

/**
 * Aplica un evento al estado del partido. Ignora los de otro partido y los repetidos.
 *
 * @param {ReturnType<typeof createMatchState>} state
 * @param {{ matchId?: number|string, id?: string, type: string, minute?: number }} event
 */
export function matchReducer(state, event) {
  if (!event || typeof event !== 'object') return state
  if (event.matchId != null && String(event.matchId) !== String(state.matchId)) return state
  if (event.id && state.timeline.some((entry) => entry.id === event.id)) return state

  const minute = event.minute ?? state.minute
  const side = event.side === 'home' || event.side === 'away' ? event.side : null

  switch (event.type) {
    case MATCH_EVENT.START:
      if (state.phase !== MATCH_PHASE.SCHEDULED) return state
      return withEntry(state, event, { phase: MATCH_PHASE.LIVE })

    case MATCH_EVENT.SCORE:
      return applyScore(state, event)

    case MATCH_EVENT.KICKOFF:
      return withEntry(state, event, { phase: MATCH_PHASE.FIRST_HALF, minute: 0 })

    case MATCH_EVENT.CLOCK:
      return { ...state, minute }

    case MATCH_EVENT.GOAL:
      if (!side) return state
      return withEntry(state, event, {
        minute,
        [side]: { ...state[side], score: state[side].score + 1 },
        lastGoal: { id: entryId(event), side, player: event.player ?? null, minute },
      })

    case MATCH_EVENT.YELLOW_CARD:
      if (!side) return state
      return withEntry(state, event, { minute, stats: bump(state.stats, 'yellowCards', side) })

    case MATCH_EVENT.RED_CARD:
      if (!side) return state
      return withEntry(state, event, { minute, stats: bump(state.stats, 'redCards', side) })

    case MATCH_EVENT.SUBSTITUTION:
      if (!side) return state
      return withEntry(state, event, { minute })

    case MATCH_EVENT.HALFTIME:
      return withEntry(state, event, { phase: MATCH_PHASE.HALFTIME, minute: 45 })

    case MATCH_EVENT.SECOND_HALF:
      return withEntry(state, event, { phase: MATCH_PHASE.SECOND_HALF, minute: 45 })

    case MATCH_EVENT.FULLTIME:
      return withEntry(state, event, { phase: MATCH_PHASE.FINISHED, minute })

    case MATCH_EVENT.STATS: {
      const incoming = event.stats ?? {}
      const stats = { ...state.stats }
      for (const key of SNAPSHOT_STATS) {
        if (incoming[key]) stats[key] = pair(incoming[key].home, incoming[key].away)
      }
      return { ...state, stats }
    }

    default:
      return state
  }
}

/**
 * Estado final de un partido jugado a partir de su historia: parte de 0-0 y aplica cada evento,
 * asi el marcador no se cuenta doble.
 *
 * @param {import('../../utils/normalizeMatch').NormalizedMatch} match
 * @param {Array<object>} events
 */
export function replayHistory(match, events) {
  const blank = createMatchState({
    ...match,
    isPlayed: false,
    one: { ...match.one, score: 0 },
    two: { ...match.two, score: 0 },
  })
  const replayed = events.reduce(matchReducer, blank)
  // un partido ya terminado no debe animar el ultimo gol al abrirlo
  return { ...replayed, lastGoal: null }
}

/** Frase corta para anunciar un evento a lectores de pantalla. */
export function describeEntry(entry, state) {
  if (!entry) return ''
  const team = entry.side ? state[entry.side].name : ''
  const at = `Minuto ${entry.minute}`

  switch (entry.type) {
    case MATCH_EVENT.GOAL:
      return `${at}: gol de ${entry.player ?? 'un jugador'} para ${team}.`
    case MATCH_EVENT.YELLOW_CARD:
      return `${at}: tarjeta amarilla para ${entry.player ?? 'un jugador'} de ${team}.`
    case MATCH_EVENT.RED_CARD:
      return `${at}: tarjeta roja para ${entry.player ?? 'un jugador'} de ${team}.`
    case MATCH_EVENT.SUBSTITUTION:
      return `${at}: cambio en ${team}, entra ${entry.playerIn} y sale ${entry.playerOut}.`
    case MATCH_EVENT.SCORE:
      return `Punto para ${team}, ${entry.score}.`
    case MATCH_EVENT.START:
    case MATCH_EVENT.KICKOFF:
      return 'Comienza el partido.'
    case MATCH_EVENT.HALFTIME:
      return 'Entretiempo.'
    case MATCH_EVENT.SECOND_HALF:
      return 'Comienza el segundo tiempo.'
    case MATCH_EVENT.FULLTIME:
      return 'Final del partido.'
    default:
      return ''
  }
}

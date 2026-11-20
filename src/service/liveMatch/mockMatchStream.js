/**
 * @file mockMatchStream.js
 * Emisor simulado: entrega los eventos que mandara el stream real (contrato en matchEvents.js), sin Kafka.
 * Es determinista por partido: `simulate` genera el partido completo, `startMockMatch` lo entrega al ritmo
 * del reloj y `buildMockHistory` de una vez (hace de la historia del backend).
 */
import { MATCH_EVENT } from './matchEvents'

const TICK_MS = 600        // un minuto de partido dura 0,6 s reales
const HALFTIME_MS = 4000
const START_DELAY_MS = 800

// Nombres inventados, solo para la simulacion
const HOME_PLAYERS = ['M. Rojas', 'B. Soto', 'J. Contreras', 'S. Fuentes', 'A. Navarro', 'D. Lagos', 'C. Pizarro', 'F. Tapia']
const AWAY_PLAYERS = ['T. Vergara', 'N. Araya', 'L. Campos', 'I. Molina', 'R. Salinas', 'E. Bravo', 'V. Godoy', 'P. Mena']

/** PRNG pequeno (mulberry32) para que un mismo partido simule siempre lo mismo. */
function createRandom(seedSource) {
  let seed = 0
  for (const char of String(seedSource)) seed = (seed * 31 + char.charCodeAt(0)) >>> 0
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (random, list) => list[Math.floor(random() * list.length)]
const between = (random, min, max) => min + Math.floor(random() * (max - min + 1))

/**
 * Guion del partido: minuto -> eventos. Con `finalScore` los goles calzan con el marcador; sin el, se sortean.
 */
function buildScript(random, finalScore) {
  const script = new Map()
  const add = (minute, type, data) => {
    const bucket = script.get(minute) ?? []
    bucket.push({ type, data })
    script.set(minute, bucket)
  }
  const players = { home: HOME_PLAYERS, away: AWAY_PLAYERS }

  let homeGoals
  let awayGoals
  if (finalScore) {
    homeGoals = finalScore.home
    awayGoals = finalScore.away
  } else {
    homeGoals = between(random, 0, 3)
    awayGoals = between(random, 0, 3)
    if (homeGoals + awayGoals === 0) homeGoals = 1
  }

  for (const [side, count] of [['home', homeGoals], ['away', awayGoals]]) {
    for (let i = 0; i < count; i += 1) {
      const scorer = pick(random, players[side])
      const assist = pick(random, players[side].filter((name) => name !== scorer))
      add(between(random, 2, 89), MATCH_EVENT.GOAL, { side, player: scorer, assist })
    }
  }

  for (let i = 0; i < between(random, 2, 4); i += 1) {
    const side = random() < 0.5 ? 'home' : 'away'
    add(between(random, 5, 88), MATCH_EVENT.YELLOW_CARD, { side, player: pick(random, players[side]) })
  }
  if (random() < 0.25) {
    const side = random() < 0.5 ? 'home' : 'away'
    add(between(random, 50, 85), MATCH_EVENT.RED_CARD, { side, player: pick(random, players[side]) })
  }
  for (const side of ['home', 'away']) {
    const names = [...players[side]]
    const playerOut = names.splice(Math.floor(random() * names.length), 1)[0]
    add(between(random, 55, 75), MATCH_EVENT.SUBSTITUTION, { side, playerIn: pick(random, names), playerOut })
  }
  return script
}

/**
 * Simula el partido completo y devuelve todos sus eventos, en orden.
 *
 * @param {{ id: number|string }} match
 * @param {{ home: number, away: number }} [finalScore]
 * @returns {Array<object>}
 */
function simulate(match, finalScore) {
  const random = createRandom(match.id)
  const script = buildScript(random, finalScore)

  // Contadores acumulados que alimentan los eventos STATS
  const totals = {
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
  }
  let possessionHome = between(random, 42, 58)
  let sequence = 0
  const events = []

  const emit = (type, data = {}) => {
    sequence += 1
    events.push({ matchId: match.id, id: `${match.id}-${sequence}`, type, ...data })
  }

  const emitStats = () => {
    emit(MATCH_EVENT.STATS, {
      stats: {
        possession: { home: possessionHome, away: 100 - possessionHome },
        shots: { ...totals.shots },
        shotsOnTarget: { ...totals.shotsOnTarget },
        passes: { ...totals.passes },
        corners: { ...totals.corners },
        fouls: { ...totals.fouls },
      },
    })
  }

  // Un minuto de juego: mueve la posesion y suma tiros, pases, corners y faltas
  const advanceCounters = () => {
    possessionHome = Math.min(65, Math.max(35, possessionHome + between(random, -2, 2)))
    for (const side of ['home', 'away']) {
      const share = (side === 'home' ? possessionHome : 100 - possessionHome) / 100
      totals.passes[side] += Math.round(share * between(random, 8, 14))
      if (random() < 0.16 + share * 0.1) {
        totals.shots[side] += 1
        if (random() < 0.45) totals.shotsOnTarget[side] += 1
      }
      if (random() < 0.05) totals.corners[side] += 1
      if (random() < 0.12) totals.fouls[side] += 1
    }
  }

  // Un gol cuenta siempre como tiro al arco
  const registerGoalShot = (side) => {
    totals.shots[side] += 1
    totals.shotsOnTarget[side] += 1
  }

  emit(MATCH_EVENT.KICKOFF, { minute: 0 })

  for (let minute = 1; minute <= 90; minute += 1) {
    advanceCounters()
    emit(MATCH_EVENT.CLOCK, { minute })

    for (const { type, data } of script.get(minute) ?? []) {
      if (type === MATCH_EVENT.GOAL) registerGoalShot(data.side)
      emit(type, { ...data, minute })
    }
    if (minute % 3 === 0) emitStats()

    if (minute === 45) {
      emitStats()
      emit(MATCH_EVENT.HALFTIME, { minute })
      emit(MATCH_EVENT.SECOND_HALF, { minute })
    }
  }

  emitStats()
  emit(MATCH_EVENT.FULLTIME, { minute: 90 })
  return events
}

/** Cuanto se espera antes de entregar un evento; los de un mismo minuto salen juntos. */
const delayBefore = (event) => {
  if (event.type === MATCH_EVENT.KICKOFF) return START_DELAY_MS
  if (event.type === MATCH_EVENT.CLOCK) return TICK_MS
  if (event.type === MATCH_EVENT.SECOND_HALF) return HALFTIME_MS
  return 0
}

/**
 * Arranca la simulacion en vivo. Devuelve la funcion que la detiene.
 *
 * @param {{ id: number|string }} match
 * @param {{ onEvent: (event: object) => void, onConnection: (state: string) => void }} handlers
 * @returns {() => void}
 */
export function startMockMatch(match, { onEvent, onConnection }) {
  const events = simulate(match)
  let index = 0
  let timer = null
  let stopped = false

  const run = () => {
    if (stopped) return
    // entrega el evento que toca y los que le siguen sin espera
    do {
      const event = events[index]
      index += 1
      onEvent(event)
      if (event.type === MATCH_EVENT.FULLTIME) {
        onConnection('ended')
        return
      }
    } while (delayBefore(events[index]) === 0)
    timer = setTimeout(run, delayBefore(events[index]))
  }

  onConnection('live')
  timer = setTimeout(run, delayBefore(events[0]))

  return () => {
    stopped = true
    clearTimeout(timer)
  }
}

/**
 * Historia simulada de un partido jugado: todos sus eventos de una vez, con el marcador del fixture.
 *
 * @param {{ id: number|string, one: { score: number|null }, two: { score: number|null } }} match
 * @returns {Array<object>}
 */
export function buildMockHistory(match) {
  return simulate(match, { home: match.one.score ?? 0, away: match.two.score ?? 0 })
}

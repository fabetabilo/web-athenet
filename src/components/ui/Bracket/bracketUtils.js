/** Rondas de una llave, de la primera a la final. */
export const ROUND_ORDER = ['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL']

/**
 * Agrupa los partidos por ronda, en orden de llave; omite las rondas vacias (copas cortas).
 *
 * @param {import('../../../utils/normalizeMatch').NormalizedMatch[]} matches
 * @returns {Array<{ phase: string, label: string, matches: import('../../../utils/normalizeMatch').NormalizedMatch[] }>}
 */
export function groupByRound(matches) {
  return ROUND_ORDER
    .map((phase) => {
      const inRound = matches.filter((match) => match.phase === phase).sort((a, b) => a.position - b.position)
      return { phase, label: inRound[0]?.phaseLabel ?? phase, matches: inRound }
    })
    .filter((round) => round.matches.length > 0)
}

/** Ronda inicial en pantallas chicas: la primera con partidos por jugar, o la final. */
export function initialRound(rounds) {
  const current = rounds.find((round) => round.matches.some((match) => !match.isPlayed))
  return (current ?? rounds[rounds.length - 1]).phase
}

/** Lado ganador de un partido terminado; null si no termino o empato. */
export function getWinner(match) {
  if (!match.isPlayed || match.one.score == null || match.two.score == null) return null
  if (match.one.score === match.two.score) return null
  return match.one.score > match.two.score ? match.one : match.two
}

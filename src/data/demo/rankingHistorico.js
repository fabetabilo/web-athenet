/**
 * Mock del ranking historico (ms-ranking) y de los equipos que lo componen.
 * Mismo formato que GET /deportes/{id}/ranking-historico; se indexa por clave de deporte.
 */

const BASE_URL = import.meta.env.BASE_URL

export const MOCK_RANKING_TEAMS = {
  101: { name: 'Halcones UDAC', institutionId: 1 },
  102: { name: 'Marea UPC', institutionId: 3, logo: `${BASE_URL}img/upc-t.png` },
  103: { name: 'Pumas UDPC', institutionId: 5 },
  104: { name: 'Cóndores PUAC', institutionId: 6 },
  105: { name: 'Tiburones UQ', institutionId: 7, logo: `${BASE_URL}img/uq-t.png` },
  106: { name: 'Navegantes ITVM', institutionId: 4 },
  107: { name: 'Titanes UTFM', institutionId: 2 },
  108: { name: 'Leones IBA', institutionId: 8 },
  201: { name: 'Águilas UDAC', institutionId: 1 },
  202: { name: 'Olas UPC', institutionId: 3, logo: `${BASE_URL}img/upc-t.png` },
  203: { name: 'Glaciares UDPC', institutionId: 5 },
  204: { name: 'Andinos PUAC', institutionId: 6 },
  205: { name: 'Rayos UQ', institutionId: 7, logo: `${BASE_URL}img/uq-t.png` },
  206: { name: 'Faros ITVM', institutionId: 4 },
  207: { name: 'Forjadores UTFM', institutionId: 2 },
  208: { name: 'Artistas IBA', institutionId: 8 },
}

// [equipoId, ganados, empatados, perdidos, puntosFavor, puntosContra]
const FUTBOL_STATS = [
  [101, 8, 2, 2, 24, 11],
  [102, 7, 3, 2, 21, 12],
  [103, 6, 3, 3, 18, 14],
  [104, 5, 4, 3, 15, 13],
  [105, 4, 3, 5, 14, 17],
  [106, 3, 4, 5, 12, 16],
  [107, 2, 3, 7, 10, 20],
  [108, 1, 2, 9, 8, 25],
]

const BASQUET_STATS = [
  [201, 9, 0, 1, 812, 701],
  [202, 8, 0, 2, 790, 712],
  [203, 6, 0, 4, 744, 730],
  [204, 5, 0, 5, 731, 728],
  [205, 4, 0, 6, 702, 735],
  [206, 3, 0, 7, 688, 741],
  [207, 2, 0, 8, 664, 770],
  [208, 1, 0, 9, 640, 790],
]

// [localId, visitaId, puntajeLocal, puntajeVisita, fecha]
const FUTBOL_LAST = [
  [101, 105, 3, 1, '2026-10-11'],
  [102, 103, 2, 2, '2026-10-11'],
  [104, 106, 1, 0, '2026-10-11'],
  [107, 108, 0, 2, '2026-10-11'],
]

const BASQUET_LAST = [
  [201, 203, 88, 79, '2026-10-10'],
  [204, 202, 84, 81, '2026-10-10'],
  [205, 206, 75, 70, '2026-10-10'],
  [207, 208, 66, 72, '2026-10-10'],
]

function buildRows(stats, lastMatches, points) {
  const lastByTeam = new Map()
  lastMatches.forEach((match) => {
    lastByTeam.set(match[0], match)
    lastByTeam.set(match[1], match)
  })

  return stats
    .map(([id, pg, pe, pp, pf, pc]) => {
      const last = lastByTeam.get(id)
      return {
        equipoId: id,
        institucionId: MOCK_RANKING_TEAMS[id].institutionId,
        pj: pg + pe + pp,
        pg,
        pe,
        pp,
        puntosFavor: pf,
        puntosContra: pc,
        diferencia: pf - pc,
        pts: pg * points.win + pe * points.draw + pp * points.loss,
        ultimoEncuentro: last && {
          competenciaId: 1,
          equipoLocalId: last[0],
          institucionLocalId: MOCK_RANKING_TEAMS[last[0]].institutionId,
          equipoVisitaId: last[1],
          institucionVisitaId: MOCK_RANKING_TEAMS[last[1]].institutionId,
          puntajeLocal: last[2],
          puntajeVisita: last[3],
          fecha: last[4],
        },
      }
    })
    .sort((a, b) => b.pts - a.pts || b.diferencia - a.diferencia)
    .map((row, index) => ({ ...row, posicion: index + 1 }))
}

export const MOCK_RANKING_BY_SPORT = {
  futbol: buildRows(FUTBOL_STATS, FUTBOL_LAST, { win: 3, draw: 1, loss: 0 }),
  basquetbol: buildRows(BASQUET_STATS, BASQUET_LAST, { win: 2, draw: 0, loss: 1 }),
}

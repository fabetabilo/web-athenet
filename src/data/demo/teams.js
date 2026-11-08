import { institutions } from './institutions'

const BASE_URL = import.meta.env.BASE_URL

export const FOOTBALL_TEAMS = {
  101: { name: 'Halcones UDAC', institutionId: 1, logo: `${BASE_URL}img/udac.png` },
  102: { name: 'Marea UPC', institutionId: 3, logo: `${BASE_URL}img/upc.png` },
  103: { name: 'Pumas UDPC', institutionId: 5, logo: `${BASE_URL}img/udpc.png` },
  104: { name: 'Cóndores PUAC', institutionId: 6, logo: `${BASE_URL}img/puac.png` },
  105: { name: 'Tiburones UQ', institutionId: 7, logo: `${BASE_URL}img/uq.png` },
  106: { name: 'Navegantes ITVM', institutionId: 4, logo: `${BASE_URL}img/itvm.png` },
  107: { name: 'Titanes UTFM', institutionId: 2, logo: `${BASE_URL}img/utfm.png` },
  108: { name: 'Leones IBA', institutionId: 8, logo: `${BASE_URL}img/iba.png` },
  109: { name: 'Zorros UDAC', institutionId: 1, logo: `${BASE_URL}img/udac.png` },
  110: { name: 'Delfines UPC', institutionId: 3, logo: `${BASE_URL}img/upc.png` },
  111: { name: 'Lobos UDPC', institutionId: 5, logo: `${BASE_URL}img/udpc.png` },
  112: { name: 'Volcanes PUAC', institutionId: 6, logo: `${BASE_URL}img/puac.png` },
  113: { name: 'Gaviotas UQ', institutionId: 7, logo: `${BASE_URL}img/uq.png` },
  114: { name: 'Anclas ITVM', institutionId: 4, logo: `${BASE_URL}img/itvm.png` },
  115: { name: 'Mineros UTFM', institutionId: 2, logo: `${BASE_URL}img/utfm.png` },
  116: { name: 'Pinceles IBA', institutionId: 8, logo: `${BASE_URL}img/iba.png` },
}

export const BASKETBALL_TEAMS = {
  201: { name: 'Águilas UDAC', institutionId: 1, logo: `${BASE_URL}img/udac.png` },
  202: { name: 'Olas UPC', institutionId: 3, logo: `${BASE_URL}img/upc.png` },
  203: { name: 'Glaciares UDPC', institutionId: 5, logo: `${BASE_URL}img/udpc.png` },
  204: { name: 'Andinos PUAC', institutionId: 6, logo: `${BASE_URL}img/puac.png` },
  205: { name: 'Rayos UQ', institutionId: 7, logo: `${BASE_URL}img/uq.png` },
  206: { name: 'Faros ITVM', institutionId: 4, logo: `${BASE_URL}img/itvm.png` },
  207: { name: 'Forjadores UTFM', institutionId: 2, logo: `${BASE_URL}img/utfm.png` },
  208: { name: 'Artistas IBA', institutionId: 8, logo: `${BASE_URL}img/iba.png` },
}

export const DEMO_TEAMS = { ...FOOTBALL_TEAMS, ...BASKETBALL_TEAMS }

const institutionById = new Map(institutions.map((institution) => [institution.id, institution]))

/** @returns {import('../../utils/normalizeEvent').TeamRef} */
export const resolveTeam = (teamId) => {
  const team = DEMO_TEAMS[teamId]
  const institution = institutionById.get(team?.institutionId)
  return {
    id: teamId,
    name: team?.name ?? null,
    acronym: institution?.acronym ?? '—',
    institution: institution?.name ?? null,
    logo: team?.logo ?? institution?.image ?? null,
  }
}

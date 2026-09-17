import axios from 'axios'
import { institutions as institutionsMock } from '../data/institutions'

const BASE_URL = import.meta.env.VITE_INSTITUTIONS_API_URL || ''
const FORCED_MOCK = import.meta.env.VITE_USE_INSTITUTION_MOCKS === 'true'

const institutionsClient = axios.create({
  baseURL: BASE_URL,
  timeout: 7000,
  headers: { Accept: 'application/json' },
})

export const INSTITUTION_ENDPOINTS = {
  INSTITUTIONS: '/instituciones',
  SEDES: '/sedes',
  TEAMS: '/equipos',
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.value)) return payload.value
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function getFallbackInstitutions() {
  return institutionsMock.map((institution) => ({
    ...institution,
    acronym: institution.acronym || institution.name.slice(0, 3).toUpperCase(),
    sedes: institution.campuses ? Array.from({ length: institution.campuses }, (_, index) => ({
      id: `${institution.id}-${index}`,
      nombre: index === 0 ? institution.campus || institution.city : `Sede ${index + 1}`,
      ciudad: institution.city,
      direccion: '',
    })) : [],
    teams: institution.teams || 0,
    disciplines: institution.disciplines || [],
    source: 'fallback',
  }))
}

function normalizeInstitution(rawInstitution, sedes, teams) {
  const institutionSedes = sedes.filter((sede) => String(sede.institucionId) === String(rawInstitution.id))
  const sedeIds = new Set(institutionSedes.map((sede) => String(sede.id)))
  const institutionTeams = teams.filter((team) => sedeIds.has(String(team.sedeId)) && team.activo !== false)
  const disciplines = [...new Set(institutionTeams.map((team) => team.deporteNombre).filter(Boolean))]
  const city = institutionSedes.map((sede) => sede.ciudad).filter(Boolean).join(' / ')

  return {
    id: rawInstitution.id,
    name: rawInstitution.nombre,
    acronym: rawInstitution.sigla,
    image: rawInstitution.imagenUrl || null,
    active: rawInstitution.activo !== false,
    sedes: institutionSedes,
    teams: institutionTeams.length,
    disciplines,
    city: city || 'Ubicacion no informada',
    campus: institutionSedes[0]?.nombre || 'Sin sede registrada',
    description: `${rawInstitution.sigla} forma parte de la comunidad deportiva Athenet.`,
    source: 'api',
  }
}

function normalizeFallbackInstitution(institution) {
  return {
    ...institution,
    acronym: institution.acronym || institution.name.slice(0, 3).toUpperCase(),
    sedes: institution.sedes || [],
    active: true,
    image: institution.image || null,
  }
}

export async function getInstitutions() {
  if (FORCED_MOCK) return getFallbackInstitutions().map(normalizeFallbackInstitution)

  try {
    const [institutionsResponse, sedesResponse, teamsResponse] = await Promise.all([
      institutionsClient.get(INSTITUTION_ENDPOINTS.INSTITUTIONS),
      institutionsClient.get(INSTITUTION_ENDPOINTS.SEDES),
      institutionsClient.get(INSTITUTION_ENDPOINTS.TEAMS),
    ])

    const sedes = unwrapCollection(sedesResponse.data)
    const teams = unwrapCollection(teamsResponse.data)

    return unwrapCollection(institutionsResponse.data)
      .filter((institution) => institution.activo !== false)
      .map((institution) => normalizeInstitution(institution, sedes, teams))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[institutionsApi] Usando datos locales por un fallo de API:', error.message)
    }
    return getFallbackInstitutions().map(normalizeFallbackInstitution)
  }
}

export async function getInstitutionById(id) {
  const institutions = await getInstitutions()
  return institutions.find((institution) => String(institution.id) === String(id)) || null
}

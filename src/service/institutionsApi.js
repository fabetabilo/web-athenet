import { createApiClient } from './apiClient'
import { institutions as institutionsMock } from '../data/demo/institutions'

/**
 * @file institutionsApi.js
 * Servicio de lectura para ms-institution (solo GET publicos), fuente de verdad de
 * instituciones, sedes, equipos y deportes.
 *
 * Los cuatro recursos se cargan una vez por sesion y se comparten entre el listado
 * de instituciones y la resolucion de referencias de otros servicios (getTeamsById, getSportsById).
 */

const { client: institutionsClient, mockMode, mockModeReason, warn, logNetworkError } = createApiClient({
  service: 'institutionsApi',
  baseUrl: import.meta.env.VITE_INSTITUTIONS_API_URL || '',
  urlVar: 'VITE_INSTITUTIONS_API_URL',
  timeout: 7000,
})

export const INSTITUTION_ENDPOINTS = {
  INSTITUTIONS: '/instituciones',
  SEDES: '/sedes',
  TEAMS: '/equipos',
  SPORTS: '/deportes',
}

function warnMocks(reason) {
  warn(`Usando datos locales: ${reason}`)
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.value)) return payload.value
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

// --- Catalogo real ------------------------------------------------------------

/** @returns {Map<string, import('../utils/normalizeEvent').TeamRef>} */
function buildTeamsById(institutions, sedes, teams) {
  const institutionById = new Map(institutions.map((institution) => [String(institution.id), institution]))
  const sedeById = new Map(sedes.map((sede) => [String(sede.id), sede]))

  return new Map(teams.map((team) => {
    const sede = sedeById.get(String(team.sedeId))
    const institution = institutionById.get(String(sede?.institucionId))
    return [String(team.id), {
      id: team.id,
      name: team.nombre,
      acronym: institution?.sigla ?? '—',
      institution: institution?.nombre ?? null,
      logo: team.logoUrl || institution?.imagenUrl || null,
    }]
  }))
}

async function fetchCatalog() {
  // Sin URL, axios pegaria al host de Vite y recibiria index.html con 200.
  if (mockMode) throw new Error(mockModeReason)

  const [institutionsRes, sedesRes, teamsRes, sportsRes] = await Promise.all([
    institutionsClient.get(INSTITUTION_ENDPOINTS.INSTITUTIONS),
    institutionsClient.get(INSTITUTION_ENDPOINTS.SEDES),
    institutionsClient.get(INSTITUTION_ENDPOINTS.TEAMS),
    institutionsClient.get(INSTITUTION_ENDPOINTS.SPORTS),
  ]).catch((error) => {
    logNetworkError('catalogo', error)
    throw error
  })

  const institutions = unwrapCollection(institutionsRes.data)
  const sedes = unwrapCollection(sedesRes.data)
  const teams = unwrapCollection(teamsRes.data)
  const sports = unwrapCollection(sportsRes.data)

  return {
    institutions,
    sedes,
    teams,
    teamsById: buildTeamsById(institutions, sedes, teams),
    sportsById: new Map(sports.map((sport) => [String(sport.id), sport.nombre])),
  }
}

let catalogPromise = null

/** Comparte una sola carga entre llamadas concurrentes; si falla, la siguiente reintenta. */
function loadCatalog() {
  catalogPromise ??= fetchCatalog().catch((error) => {
    catalogPromise = null
    throw error
  })
  return catalogPromise
}

/**
 * Equipos reales indexados por id (String). Incluye inactivos: un evento ya creado
 * debe seguir mostrando a sus equipos. Rechaza si ms-institution no esta disponible.
 * @returns {Promise<Map<string, import('../utils/normalizeEvent').TeamRef>>}
 */
export async function getTeamsById() {
  return (await loadCatalog()).teamsById
}

/**
 * Nombres de deportes reales indexados por id (String). Rechaza si ms-institution no esta disponible.
 * @returns {Promise<Map<string, string>>}
 */
export async function getSportsById() {
  return (await loadCatalog()).sportsById
}

/**
 * Instituciones reales indexadas por id (String), con nombre, sigla y logo.
 * Rechaza si ms-institution no esta disponible.
 * @returns {Promise<Map<string, { id: number, name: string, acronym: string, logo: string|null }>>}
 */
export async function getInstitutionsById() {
  const { institutions } = await loadCatalog()
  return new Map(institutions.map((institution) => [String(institution.id), {
    id: institution.id,
    name: institution.nombre,
    acronym: institution.sigla,
    logo: institution.imagenUrl || null,
  }]))
}

// --- Instituciones -------------------------------------------------------------

function normalizeMockInstitution(institution) {
  return {
    ...institution,
    acronym: institution.acronym || institution.name.slice(0, 3).toUpperCase(),
    image: institution.image || null,
    active: true,
    sedes: Array.from({ length: institution.campuses || 0 }, (_, index) => ({
      id: `${institution.id}-${index}`,
      nombre: index === 0 ? institution.campus || institution.city : `Sede ${index + 1}`,
      ciudad: institution.city,
      direccion: '',
    })),
    teams: institution.teams || 0,
    disciplines: institution.disciplines || [],
    source: 'mock',
  }
}

const getMockInstitutions = () => institutionsMock.map(normalizeMockInstitution)

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

export async function getInstitutions() {
  if (mockMode) {
    warnMocks(mockModeReason)
    return getMockInstitutions()
  }

  const { institutions, sedes, teams } = await loadCatalog()
  return institutions
    .filter((institution) => institution.activo !== false)
    .map((institution) => normalizeInstitution(institution, sedes, teams))
}

export async function getInstitutionById(id) {
  if (mockMode) {
    warnMocks(mockModeReason)
    return getMockInstitutions().find((institution) => String(institution.id) === String(id)) ?? null
  }

  const { institutions, sedes, teams } = await loadCatalog()
  const institution = institutions.find((item) => String(item.id) === String(id))
  if (!institution || institution.activo === false) return null
  return normalizeInstitution(institution, sedes, teams)
}

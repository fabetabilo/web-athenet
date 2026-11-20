/**
 * @file mockAuth.js
 * Autenticacion simulada para desarrollar sin backend. Cumple el mismo contrato que cognitoAuth.
 *
 * - NUNCA guarda ni valida contrasenas: acepta cualquiera.
 * - Los usuarios y la sesion viven en localStorage del navegador (con respaldo en memoria).
 * - El codigo de verificacion es siempre MOCK_VERIFICATION_CODE.
 */

import { AuthError } from './AuthError'
import { MOCK_VERIFICATION_CODE } from './authConfig'

const USERS_KEY = 'athenet.auth.mock.users'
const PENDING_KEY = 'athenet.auth.mock.pending'
const SESSION_KEY = 'athenet.auth.mock.session'
const LATENCY_MS = 450

const memory = new Map()

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
const normalize = (email) => String(email).trim().toLowerCase()

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    // storage bloqueado o JSON invalido: se usa la copia en memoria
  }
  return memory.get(key) ?? fallback
}

function write(key, value) {
  memory.set(key, value)
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sin storage la simulacion sigue funcionando mientras la pestana viva
  }
}

function remove(key) {
  memory.delete(key)
  try {
    localStorage.removeItem(key)
  } catch {
    // nada que limpiar
  }
}

const toUser = (profile) => ({
  id: `mock-${profile.email}`,
  email: profile.email,
  nombre: profile.nombre,
  apellido: profile.apellido,
  genero: profile.genero,
  region: profile.region,
  foto: profile.foto || undefined,
})

export async function signUp({ nombre, apellido, genero, region, email }) {
  await wait()
  const key = normalize(email)
  if (read(USERS_KEY, {})[key]) throw new AuthError('USER_EXISTS')

  write(PENDING_KEY, { ...read(PENDING_KEY, {}), [key]: { email: key, nombre, apellido, genero, region } })
  return { needsConfirmation: true }
}

export async function confirmSignUp({ email, code }) {
  await wait()
  const key = normalize(email)
  const pending = read(PENDING_KEY, {})
  const profile = pending[key]

  if (!profile) throw new AuthError('EXPIRED_CODE')
  if (String(code).trim() !== MOCK_VERIFICATION_CODE) throw new AuthError('INVALID_CODE')

  delete pending[key]
  write(PENDING_KEY, pending)
  write(USERS_KEY, { ...read(USERS_KEY, {}), [key]: profile })
}

export async function resendCode({ email }) {
  await wait()
  if (!read(PENDING_KEY, {})[normalize(email)]) throw new AuthError('UNKNOWN')
}

export async function signIn({ email }) {
  await wait()
  const key = normalize(email)

  if (read(PENDING_KEY, {})[key]) throw new AuthError('UNCONFIRMED')
  const profile = read(USERS_KEY, {})[key]
  if (!profile) throw new AuthError('INVALID_CREDENTIALS')

  write(SESSION_KEY, { email: key })
  return toUser(profile)
}

/**
 * Actualiza los datos editables del usuario con sesion. `patch` puede traer
 * nombre, apellido, genero, region y foto (data URL; `null` la quita).
 */
export async function updateProfile(patch) {
  await wait()
  const session = read(SESSION_KEY, null)
  const users = read(USERS_KEY, {})
  const current = session && users[session.email]
  if (!current) throw new AuthError('UNKNOWN')

  const next = { ...current, ...patch }
  if (next.foto === null) delete next.foto
  write(USERS_KEY, { ...users, [session.email]: next })
  return toUser(next)
}

export async function signOut() {
  remove(SESSION_KEY)
}

export async function getCurrentUser() {
  const session = read(SESSION_KEY, null)
  const profile = session && read(USERS_KEY, {})[session.email]
  return profile ? toUser(profile) : null
}

/** Token para los endpoints protegidos del futuro; la simulacion no emite uno real. */
export async function getAccessToken() {
  return (await getCurrentUser()) ? 'mock-access-token' : null
}

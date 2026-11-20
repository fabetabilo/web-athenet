/**
 * @file cognitoAuth.js
 * Implementacion con AWS Cognito (Amplify v6). Mismo contrato que mockAuth.
 * Nombre, apellido, genero y region viven como atributos del usuario en Cognito.
 * La foto queda solo en este navegador.
 */

import { AuthError } from './AuthError'
import { COGNITO_CONFIG } from './authConfig'

// Atributo de Cognito de cada campo editable
const ATTRIBUTES = {
  nombre: 'given_name',
  apellido: 'family_name',
  genero: 'gender',
  region: 'custom:region',
}

const PHOTO_KEY = 'athenet.auth.photo.'
const photoMemory = new Map()

const normalize = (email) => String(email).trim().toLowerCase()

/**
 * Traduce un error de Cognito a un AuthError.
 *
 * @param {{ name?: string, message?: string }} error
 * @returns {AuthError}
 */
export function mapCognitoError(error) {
  const byName = {
    UsernameExistsException: 'USER_EXISTS',
    InvalidPasswordException: 'INVALID_PASSWORD',
    CodeMismatchException: 'INVALID_CODE',
    ExpiredCodeException: 'EXPIRED_CODE',
    NotAuthorizedException: 'INVALID_CREDENTIALS',
    UserNotFoundException: 'INVALID_CREDENTIALS',
    UserNotConfirmedException: 'UNCONFIRMED',
    LimitExceededException: 'TOO_MANY_REQUESTS',
    TooManyRequestsException: 'TOO_MANY_REQUESTS',
    TooManyFailedAttemptsException: 'TOO_MANY_REQUESTS',
  }
  // Cognito reporta una contrasena fuera de politica tambien como parametro invalido
  if (error?.name === 'InvalidParameterException' && /password/i.test(error?.message ?? '')) {
    return new AuthError('INVALID_PASSWORD', error.message)
  }
  return new AuthError(byName[error?.name] ?? 'UNKNOWN', error?.message)
}

let authPromise

// Carga y configura Amplify una sola vez; el modo simulado nunca lo descarga
function loadAuth() {
  authPromise ??= Promise.all([import('aws-amplify'), import('aws-amplify/auth')])
    .then(([{ Amplify }, auth]) => {
      Amplify.configure({
        Auth: { Cognito: { userPoolId: COGNITO_CONFIG.userPoolId, userPoolClientId: COGNITO_CONFIG.clientId } },
      })
      return auth
    })
    .catch((error) => {
      authPromise = undefined
      throw error
    })
  return authPromise
}

// Ejecuta una accion con Amplify cargado y entrega cualquier fallo como AuthError
async function run(action) {
  try {
    return await action(await loadAuth())
  } catch (error) {
    throw error instanceof AuthError ? error : mapCognitoError(error)
  }
}

function readPhoto(userId) {
  try {
    return localStorage.getItem(PHOTO_KEY + userId) || photoMemory.get(userId) || undefined
  } catch {
    return photoMemory.get(userId)
  }
}

function writePhoto(userId, photo) {
  if (photo) photoMemory.set(userId, photo)
  else photoMemory.delete(userId)
  try {
    if (photo) localStorage.setItem(PHOTO_KEY + userId, photo)
    else localStorage.removeItem(PHOTO_KEY + userId)
  } catch {
    // sin storage la foto dura mientras la pestana viva
  }
}

// Arma el usuario de la app desde los atributos de la sesion actual
async function buildUser(auth) {
  const attributes = await auth.fetchUserAttributes()
  return {
    id: attributes.sub,
    email: attributes.email,
    nombre: attributes.given_name ?? '',
    apellido: attributes.family_name ?? '',
    genero: attributes.gender,
    region: attributes['custom:region'] ?? '',
    foto: readPhoto(attributes.sub),
  }
}

export const signUp = ({ nombre, apellido, genero, region, email, password }) =>
  run(async (auth) => {
    const username = normalize(email)
    const { nextStep } = await auth.signUp({
      username,
      password,
      options: {
        userAttributes: {
          email: username,
          given_name: nombre,
          family_name: apellido,
          gender: genero,
          'custom:region': region,
        },
      },
    })
    return { needsConfirmation: nextStep.signUpStep !== 'DONE' }
  })

export const confirmSignUp = ({ email, code }) =>
  run(async (auth) => {
    await auth.confirmSignUp({ username: normalize(email), confirmationCode: String(code).trim() })
  })

export const resendCode = ({ email }) =>
  run(async (auth) => {
    await auth.resendSignUpCode({ username: normalize(email) })
  })

export const signIn = ({ email, password }) =>
  run(async (auth) => {
    const username = normalize(email)
    const attempt = () => auth.signIn({ username, password })

    let result
    try {
      result = await attempt()
    } catch (error) {
      if (error?.name !== 'UserAlreadyAuthenticatedException') throw error
      // una sesion previa bloquea un nuevo inicio: se cierra y se reintenta
      await auth.signOut()
      result = await attempt()
    }

    if (!result.isSignedIn) {
      throw new AuthError(result.nextStep?.signInStep === 'CONFIRM_SIGN_UP' ? 'UNCONFIRMED' : 'UNKNOWN')
    }
    return buildUser(auth)
  })

/**
 * Actualiza los datos del usuario con sesion. Los campos de texto van a los atributos
 * de Cognito; `foto` (data URL, o null para quitarla) se guarda solo en este navegador.
 */
export const updateProfile = (patch) =>
  run(async (auth) => {
    const { userId } = await auth.getCurrentUser()

    const userAttributes = {}
    for (const [field, attribute] of Object.entries(ATTRIBUTES)) {
      if (patch[field] !== undefined) userAttributes[attribute] = patch[field]
    }
    if (Object.keys(userAttributes).length > 0) await auth.updateUserAttributes({ userAttributes })

    if ('foto' in patch) writePhoto(userId, patch.foto)
    return buildUser(auth)
  })

export const signOut = () =>
  run(async (auth) => {
    await auth.signOut()
  })

// Sin sesion (o sin poder leerla) devuelve null: la app queda como visitante
export async function getCurrentUser() {
  try {
    const auth = await loadAuth()
    await auth.getCurrentUser()
    return await buildUser(auth)
  } catch (error) {
    if (import.meta.env.DEV && error?.name !== 'UserUnAuthenticatedException') console.warn('[auth]', error)
    return null
  }
}

export async function getAccessToken() {
  try {
    const { tokens } = await (await loadAuth()).fetchAuthSession()
    return tokens?.accessToken?.toString() ?? null
  } catch {
    return null
  }
}

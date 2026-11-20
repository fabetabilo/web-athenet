/**
 * @file cognitoAuth.js
 * Esqueleto de la implementacion con AWS Cognito. Mismo contrato que mockAuth.
 */

import { AuthError } from './AuthError'

const notReady = (name) => new AuthError('NOT_IMPLEMENTED', `cognitoAuth.${name} aun no esta implementado`)

/**
 * Traduce un error de Cognito a un AuthError. Ya funciona: el contrato de errores no cambia.
 *
 * @param {{ name?: string }} error
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
  return new AuthError(byName[error?.name] ?? 'UNKNOWN', error?.message)
}

/**
 * Amplify: signUp({ username: email, password, options: { userAttributes: {
 *   email, given_name: nombre, family_name: apellido, gender: genero,
 *   'custom:region': region } } })
 */
export async function signUp() {
  throw notReady('signUp')
}

/** Amplify: confirmSignUp({ username: email, confirmationCode: code }) */
export async function confirmSignUp() {
  throw notReady('confirmSignUp')
}

/** Amplify: resendSignUpCode({ username: email }) */
export async function resendCode() {
  throw notReady('resendCode')
}

/** Amplify: signIn({ username: email, password }), luego fetchUserAttributes() para armar el usuario */
export async function signIn() {
  throw notReady('signIn')
}

/**
 * Amplify: updateUserAttributes({ userAttributes: { given_name, family_name, gender, 'custom:region', picture } })
 * `custom:region` debe existir como atributo personalizado del User Pool.
 * `picture` sera la URL de la foto (S3), no la imagen en base64 que usa la simulacion.
 */
export async function updateProfile() {
  throw notReady('updateProfile')
}

/** Amplify: signOut() */
export async function signOut() {
  throw notReady('signOut')
}

/** Amplify: getCurrentUser() + fetchUserAttributes(); devolver null si no hay sesion */
export async function getCurrentUser() {
  return null
}

/** Amplify: (await fetchAuthSession()).tokens?.accessToken?.toString() ?? null */
export async function getAccessToken() {
  return null
}

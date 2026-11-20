/**
 * @file authService.js
 * Punto unico de acceso a la autenticacion. Elige la implementacion segun AUTH_MOCK_MODE.
 *
 * Contrato (ambas implementaciones lo cumplen; los errores son AuthError):
 *   signUp({ nombre, apellido, genero, region, email, password }) -> { needsConfirmation }
 *   confirmSignUp({ email, code })
 *   resendCode({ email })
 *   signIn({ email, password }) -> user { id, email, nombre, apellido, genero, region, foto }
 *   updateProfile({ nombre?, apellido?, genero?, region?, foto? }) -> user   (foto: data URL o null para quitarla)
 *   signOut()
 *   getCurrentUser() -> user | null
 *   getAccessToken() -> string | null   (para el header Authorization de endpoints protegidos)
 */

import { AUTH_MOCK_MODE } from './authConfig'
import * as mockAuth from './mockAuth'
import * as cognitoAuth from './cognitoAuth'

const implementation = AUTH_MOCK_MODE ? mockAuth : cognitoAuth

export const { signUp, confirmSignUp, resendCode, signIn, signOut, updateProfile, getCurrentUser, getAccessToken } =
  implementation

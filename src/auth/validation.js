/**
 * Validaciones de los formularios de acceso. Cada funcion devuelve un mensaje de error
 * o '' si el valor es valido.
 */

import { PASSWORD_RULES, VERIFICATION_CODE_LENGTH } from './authConfig'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const validateName = (value, label) => {
  const text = value.trim()
  if (!text) return `Ingresa tu ${label}.`
  if (text.length < 2) return `Tu ${label} es demasiado corto.`
  return ''
}

export const validateEmail = (value) => {
  const text = value.trim()
  if (!text) return 'Ingresa tu correo.'
  return EMAIL_PATTERN.test(text) ? '' : 'Ingresa un correo válido.'
}

export const validatePassword = (value) => {
  if (!value) return 'Ingresa una contraseña.'
  return PASSWORD_RULES.every((rule) => rule.test(value)) ? '' : 'La contraseña no cumple los requisitos.'
}

export const validateCode = (value) =>
  new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(value.trim())
    ? ''
    : `Ingresa el código de ${VERIFICATION_CODE_LENGTH} dígitos.`

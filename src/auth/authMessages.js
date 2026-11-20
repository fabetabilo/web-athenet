/**
 * Mensajes para el usuario segun el codigo de AuthError. Las pantallas no muestran
 * el texto crudo del proveedor (puede venir en ingles o revelar detalles internos).
 */

const MESSAGES = {
  USER_EXISTS: 'Ya existe una cuenta con este correo.',
  INVALID_PASSWORD: 'La contraseña no cumple los requisitos.',
  INVALID_CODE: 'El código no es correcto. Revísalo e inténtalo de nuevo.',
  EXPIRED_CODE: 'El código expiró. Solicita uno nuevo.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  UNCONFIRMED: 'Tu cuenta aún no está verificada.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  NOT_IMPLEMENTED: 'El acceso de usuarios aún no está disponible.',
}

const FALLBACK = 'Algo salió mal. Inténtalo de nuevo.'

/** @param {{ code?: string }} error */
export function getAuthMessage(error) {
  return MESSAGES[error?.code] ?? FALLBACK
}

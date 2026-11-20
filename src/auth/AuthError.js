/**
 * Error de autenticacion con un codigo estable, independiente del proveedor.
 * Las pantallas solo conocen estos codigos; cada implementacion (simulada o Cognito)
 * traduce sus errores a ellos.
 *
 * Codigos: USER_EXISTS, INVALID_PASSWORD, INVALID_CODE, EXPIRED_CODE, INVALID_CREDENTIALS,
 * UNCONFIRMED, TOO_MANY_REQUESTS, NOT_IMPLEMENTED, UNKNOWN.
 */
export class AuthError extends Error {
  /**
   * @param {string} code
   * @param {string} [message]
   */
  constructor(code, message) {
    super(message ?? code)
    this.name = 'AuthError'
    this.code = code
  }
}

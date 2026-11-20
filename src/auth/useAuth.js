import { useContext } from 'react'
import { AuthContext } from './authContext'

/**
 * Sesion y acciones de autenticacion:
 * { user, status, authEnabled, isMock, authView, openAuth, closeAuth, signUp, confirmSignUp,
 *   resendCode, signIn, signOut, updateProfile }
 * `status`: 'loading' | 'authenticated' | 'anonymous'. `authView`: 'login' | 'register' | null.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

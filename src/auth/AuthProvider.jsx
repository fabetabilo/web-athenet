import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { AUTH_ENABLED, AUTH_MOCK_MODE } from './authConfig'
import * as authService from './authService'

/**
 * Mantiene la sesion y el estado del modal de acceso (que vista esta abierta).
 * El resto de las acciones (registro, verificacion) no guardan estado: se delegan al servicio.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [authView, setAuthView] = useState(null)

  // Recupera la sesion existente al cargar la pagina
  useEffect(() => {
    let active = true
    authService
      .getCurrentUser()
      .then((current) => {
        if (!active) return
        setUser(current)
        setStatus(current ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (active) setStatus('anonymous')
      })
    return () => {
      active = false
    }
  }, [])

  const openAuth = useCallback((view = 'login') => setAuthView(view), [])
  const closeAuth = useCallback(() => setAuthView(null), [])

  const signIn = useCallback(async (credentials) => {
    const current = await authService.signIn(credentials)
    setUser(current)
    setStatus('authenticated')
    return current
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const current = await authService.updateProfile(patch)
    setUser(current)
    return current
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      authEnabled: AUTH_ENABLED,
      isMock: AUTH_MOCK_MODE,
      authView,
      openAuth,
      closeAuth,
      signIn,
      signOut,
      updateProfile,
      signUp: authService.signUp,
      confirmSignUp: authService.confirmSignUp,
      resendCode: authService.resendCode,
    }),
    [user, status, authView, openAuth, closeAuth, signIn, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

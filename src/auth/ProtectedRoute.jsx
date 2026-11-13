import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Protege una ruta para usuarios con sesion. Sin sesion vuelve al inicio y abre el modal
 * de acceso; si la sesion se cierra estando en la ruta, solo vuelve al inicio.
 */
export default function ProtectedRoute({ children }) {
  const { status, authEnabled, openAuth } = useAuth()
  const hadSession = useRef(false)

  useEffect(() => {
    if (status === 'authenticated') hadSession.current = true
    else if (status === 'anonymous' && authEnabled && !hadSession.current) openAuth('login')
  }, [status, authEnabled, openAuth])

  if (status === 'loading') return null
  if (status !== 'authenticated') return <Navigate to="/" replace />
  return children
}

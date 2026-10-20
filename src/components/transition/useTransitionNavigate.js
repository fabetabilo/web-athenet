import { useCallback } from 'react'
import { resolvePath, useLocation, useNavigate } from 'react-router-dom'
import { useRouteTransition } from './routeTransitionContext'

/**
 * Reemplazo de useNavigate() que pasa por la pantalla de transición.
 *
 * Misma firma que useNavigate, más la opción `transition`:
 *   navigate('/events/5')                              // decide solo
 *   navigate('/events/5', { transition: 'always' })    // fuerza la cortina
 *   navigate('/events/5', { transition: 'never' })     // nunca anima
 *
 * Si la navegación no cruza de sección delega en el navigate normal, así que
 * migrar un sitio que nunca cruza es inocuo.
 */
export function useTransitionNavigate() {
  const navigate = useNavigate()
  const location = useLocation()
  const { requestTransition } = useRouteTransition()

  return useCallback(
    (to, options = {}) => {
      // navigate(-1) y amigos: el historial del navegador no se puede retener.
      if (typeof to === 'number') return navigate(to)

      const { transition, ...navigateOptions } = options
      // resolvePath es función, no hook: sirve para un `to` dinámico en tiempo
      // de llamada. Devuelve el path SIN basename, igual que location.pathname.
      const resolvedPath = resolvePath(to, location.pathname).pathname

      if (requestTransition(to, { ...navigateOptions, transition, resolvedPath })) return
      return navigate(to, navigateOptions)
    },
    [navigate, location.pathname, requestTransition],
  )
}

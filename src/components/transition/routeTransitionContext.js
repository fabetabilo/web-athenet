import { createContext, useContext } from 'react'

/**
 * Archivo sin componentes: la regla only-export-components de react-refresh
 * salta en módulos que los mezclan con otros exports. El valor por defecto es
 * inerte a propósito: un link de transición fuera del provider navega normal.
 */
export const RouteTransitionContext = createContext({
  phase: 'idle',
  isCovering: false,
  requestTransition: () => false,
  registerHold: () => () => {},
})

/** Acceso al estado y a las acciones de la pantalla de transición. */
export function useRouteTransition() {
  return useContext(RouteTransitionContext)
}

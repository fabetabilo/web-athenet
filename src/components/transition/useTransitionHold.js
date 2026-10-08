import { useEffect } from 'react'
import { useRouteTransition } from './routeTransitionContext'

/**
 * Pide que la cortina se quede puesta mientras la página carga, para que se
 * revele ya poblada. Sólo puede ALARGAR la espera, nunca acortarla, y el
 * provider tiene un tope duro (--rt-hold-max). Ver README.md.
 *
 * @param {boolean} active - true mientras la página siga cargando
 */
export function useTransitionHold(active) {
  const { registerHold } = useRouteTransition()

  useEffect(() => {
    if (!active) return undefined
    // El liberador que devuelve registerHold deja el contador neto en cero
    // aunque StrictMode monte el efecto dos veces.
    return registerHold()
  }, [active, registerHold])
}

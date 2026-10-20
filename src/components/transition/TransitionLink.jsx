import { Link, NavLink, useResolvedPath } from 'react-router-dom'
import { useRouteTransition } from './routeTransitionContext'

/**
 * Links que pasan por la pantalla de transicion. Renderizan el Link / NavLink
 * real, asi que href, ctrl+click, "abrir en pestana nueva" y el foco siguen
 * igual: lo unico que cambia es que, si la navegacion cruza de seccion, la URL
 * espera a que la cortina cubra.
 *
 * transition: 'auto' (default, anima solo si cruza) | 'always' | 'never'
 */
function TransitionAnchor({ as: Component, to, transition = 'auto', onClick, ...props }) {
  const { requestTransition } = useRouteTransition()
  // Resuelve relativas y devuelve el path SIN basename, igual que location.pathname.
  const resolved = useResolvedPath(to)

  const handleClick = (event) => {
    // Primero el consumidor: asi el onClick que cierra el drawer sigue corriendo.
    onClick?.(event)
    if (event.defaultPrevented) return

    // Abrir en pestana nueva no es una transicion: que lo siga haciendo el navegador.
    if (event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (props.target && props.target !== '_self') return

    // Todas las opciones que acepta Link, o el navigate diferido resolveria distinto.
    const { replace, state, relative, preventScrollReset } = props
    const handled = requestTransition(to, {
      transition, replace, state, relative, preventScrollReset,
      resolvedPath: resolved.pathname,
    })
    if (handled) event.preventDefault()
  }

  return <Component to={to} {...props} onClick={handleClick} />
}

export default function TransitionLink(props) {
  return <TransitionAnchor as={Link} {...props} />
}

/** Igual, pero conserva el render-prop isActive de NavLink. */
export function TransitionNavLink(props) {
  return <TransitionAnchor as={NavLink} {...props} />
}

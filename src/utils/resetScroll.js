/**
 * Lleva la página al tope tras navegar. El segundo scroll, un frame más tarde,
 * hace falta porque el alto del destino aún no está maquetado en el primer tick.
 */
export function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
}

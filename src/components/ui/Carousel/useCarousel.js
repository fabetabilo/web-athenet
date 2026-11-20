import { useCallback, useState } from 'react'

/**
 * Indice activo con vuelta al inicio y desplazamiento del track.
 * Requiere `--card-width` y `--gap` en el CSS del track; asume que toda card
 * anterior a la activa mide `--card-width`.
 *
 * @param {number} count - Cantidad de items
 */
export function useCarousel(count) {
  const [rawIndex, setRawIndex] = useState(0)

  // si la lista se achica, el track no queda desplazado al vacio
  const index = count > 0 ? Math.min(rawIndex, count - 1) : 0
  const canNavigate = count > 1

  const next = useCallback(() => {
    if (count < 2) return
    setRawIndex((prev) => (Math.min(prev, count - 1) + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    if (count < 2) return
    setRawIndex((prev) => (Math.min(prev, count - 1) - 1 + count) % count)
  }, [count])

  const goTo = useCallback((target) => {
    if (count === 0) return
    setRawIndex(((target % count) + count) % count)
  }, [count])

  const trackStyle = {
    transform: `translateX(calc(-${index} * (var(--card-width) + var(--gap))))`,
  }

  return { index, next, prev, goTo, canNavigate, trackStyle }
}

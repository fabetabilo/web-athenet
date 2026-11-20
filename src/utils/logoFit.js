/**
 * Mide la parte visible (no transparente) de un escudo para alinear escudos de distinto margen.
 * Devuelve null si no se puede leer (ej. imagen remota sin CORS).
 */

const SAMPLE = 128          // lado del lienzo de medicion
const ALPHA_MIN = 20        // bajo este alfa el pixel cuenta como transparente
const cache = new Map()     // src -> medida

/**
 * @param {HTMLImageElement} img - Imagen ya cargada
 * @returns {{ left: number, top: number, right: number, bottom: number } | null}
 *   Caja visible como fraccion (0-1) del cuadrado que contiene la imagen centrada (contain)
 */
export function measureLogo(img) {
  const key = img.currentSrc || img.src
  if (cache.has(key)) return cache.get(key)

  let box = null
  try {
    const { naturalWidth: w, naturalHeight: h } = img
    if (w && h) {
      const canvas = document.createElement('canvas')
      canvas.width = SAMPLE
      canvas.height = SAMPLE
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      const f = SAMPLE / Math.max(w, h)
      ctx.drawImage(img, (SAMPLE - w * f) / 2, (SAMPLE - h * f) / 2, w * f, h * f)
      const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE)

      let left = SAMPLE, top = SAMPLE, right = -1, bottom = -1
      for (let y = 0; y < SAMPLE; y++) {
        for (let x = 0; x < SAMPLE; x++) {
          if (data[(y * SAMPLE + x) * 4 + 3] <= ALPHA_MIN) continue
          if (x < left) left = x
          if (x > right) right = x
          if (y < top) top = y
          if (y > bottom) bottom = y
        }
      }
      if (right >= 0) {
        box = { left: left / SAMPLE, top: top / SAMPLE, right: (right + 1) / SAMPLE, bottom: (bottom + 1) / SAMPLE }
      }
    }
  } catch {
    box = null   // lienzo "contaminado" por una imagen de otro origen: se deja el ajuste por defecto
  }

  cache.set(key, box)
  return box
}

/**
 * Prepara una foto de perfil: valida tipo y peso, la recorta al centro en cuadrado y la
 * reduce, para que quede liviana (se guarda como data URL en la simulacion).
 */

export const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024

/**
 * @param {File} file
 * @param {number} [size=256] - Lado final en pixeles.
 * @returns {Promise<string>} data URL JPEG.
 * @throws {Error} con un mensaje listo para mostrar al usuario.
 */
export async function resizeImageToDataUrl(file, size = 256) {
  if (!PHOTO_TYPES.includes(file.type)) throw new Error('Usa una imagen PNG, JPG o WebP.')
  if (file.size > PHOTO_MAX_BYTES) throw new Error('La imagen supera los 5 MB.')

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No pudimos leer la imagen. Prueba con otra.')
  }

  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas
    .getContext('2d')
    .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', 0.85)
}

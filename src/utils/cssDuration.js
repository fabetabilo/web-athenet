/**
 * Lee una duración declarada como custom property y la devuelve en ms, para que
 * el CSS siga siendo la única fuente de verdad del tiempo.
 *
 * OJO: getPropertyValue no resuelve calc() sobre una custom property sin
 * registrar, así que las variables que pasen por acá deben ser literales.
 */
export function readDurationMs(element, varName, fallbackMs) {
  if (!element) return fallbackMs

  const raw = getComputedStyle(element).getPropertyValue(varName).trim()
  if (!raw) return fallbackMs

  const value = Number.parseFloat(raw)
  if (Number.isNaN(value)) return fallbackMs

  // Sin unidad se asume ms; 's' se convierte. Un calc() cae al fallback porque
  // parseFloat sobre 'calc(...' devuelve NaN.
  return raw.endsWith('ms') ? value : raw.endsWith('s') ? value * 1000 : value
}

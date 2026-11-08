/**
 * @file demoDates.js
 * Fechas de los datasets demo, relativas al momento de carga: con fechas absolutas el
 * dataset envejece y el demo termina mostrando como vigente algo que ya ocurrio.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const pad = (value) => String(value).padStart(2, '0')

/** Fecha local a N dias de hoy, en el "YYYY-MM-DD" que entrega ms-events. */
export function daysFromToday(days) {
  const date = new Date(Date.now() + days * DAY_MS)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

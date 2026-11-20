/**
 * Arma la fecha en hora local por componentes
 *
 * @param {string} dateTime - "YYYY-MM-DDTHH:mm" (la hora es opcional)
 * @returns {Date}
 */
export function parseLocalDateTime(dateTime) {
  const [datePart, timePart = '00:00'] = dateTime.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hours || 0, minutes || 0)
}

/**
 * Rango de fechas legible en es-CL, sin repetir el mes ni el año cuando coinciden.
 *
 * @param {string} startIso - "YYYY-MM-DD"
 * @param {string} endIso - "YYYY-MM-DD"
 * @returns {string} Ej: "9 - 15 de noviembre de 2026", "28 de noviembre - 14 de diciembre de 2026"
 */
export function formatDateRange(startIso, endIso) {
  const start = parseLocalDateTime(startIso)
  const end = parseLocalDateTime(endIso)
  const format = (date, options) => date.toLocaleDateString('es-CL', options)
  const full = { day: 'numeric', month: 'long', year: 'numeric' }

  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth && start.getDate() === end.getDate()) return format(start, full)
  if (sameMonth) return `${start.getDate()} - ${format(end, full)}`
  if (sameYear) return `${format(start, { day: 'numeric', month: 'long' })} - ${format(end, full)}`
  return `${format(start, full)} - ${format(end, full)}`
}

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

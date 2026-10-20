/**
 * Bloqueo de scroll del body con contador, porque hay más de un dueño del mismo
 * estilo: el drawer del navbar y la cortina de transición pueden estar activos a
 * la vez, y sin contador el cleanup del primero desbloquearía al que sigue.
 *
 * El reset de index.css esconde las scrollbars, así que bloquear no produce
 * salto de layout y no hace falta compensar con padding-right.
 */

let locks = 0

export function lockScroll() {
  locks += 1
  if (locks === 1) document.body.style.overflow = 'hidden'
}

export function unlockScroll() {
  if (locks === 0) return
  locks -= 1
  if (locks === 0) document.body.style.overflow = ''
}

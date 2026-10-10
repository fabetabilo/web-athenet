/**
 * Diccionario de resolucion de instituciones.
 *
 * Alimenta el marcador mientras ms-competitions no mande sigla ni escudo.
 * Se inyecta en normalizeMatch para que utils/ no dependa de datos de demo.
 */

import { institutions } from './institutions'

/** @returns {{ acronym: string, image: string|null }} */
export const resolveInstitution = (id) => {
  const found = institutions.find((i) => i.id === id)
  return { acronym: found?.acronym ?? '—', image: found?.image ?? null }
}

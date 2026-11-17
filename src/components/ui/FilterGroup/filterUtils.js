/** Valor de la opcion "todos": no filtra nada. */
export const FILTER_ALL = 'all'

/** Valores distintos de un campo, para armar las opciones de un filtro. */
export const uniqueValues = (items, pick) => [...new Set(items.map(pick).filter(Boolean))]

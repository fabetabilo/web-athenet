/**
 * Mock del catalogo de deportes (Deporte de ms-institution).
 *
 * ms-events solo entrega sportId; este diccionario lo resuelve a nombre y se
 * inyecta en normalizeEvent, igual que el de equipos.
 */
export const MOCK_SPORTS = {
  1: 'Fútbol',
  2: 'Basquetbol',
  3: 'Vóleibol',
  4: 'Ajedrez',
  5: 'Tenis',
  6: 'Natación',
  7: 'Futsal',
  8: 'Vóleibol Playa',
  9: 'Balonmano',
  10: 'Rugby',
  11: 'Judo',
  12: 'Karate',
  13: 'Taekwondo',
  14: 'Tenis de Mesa',
  15: 'Gimnasia',
  16: 'Gimnasia Rítmica',
  17: 'Escalada Deportiva',
  18: 'Levantamiento de Pesas',
  19: 'Cross Country',
  20: 'Atletismo',
}

/** @param {number} sportId @returns {string|null} */
export const resolveSport = (sportId) => MOCK_SPORTS[sportId] ?? null

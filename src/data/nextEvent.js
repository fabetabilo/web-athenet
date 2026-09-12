/**
 * Mock del evento más próximo, simula llamada a la API.
 * Shape alineado con el modelo real de ms-events.
 */
export const nextEvent = {
  internalId: 'EVT-1',
  title: 'Campeonato Sudamericano',
  description: 'Campeonato Sudamericano de Tenis de Mesa universitario.',
  description_opt: null,
  coverImage: 'https://images.unsplash.com/photo-1659303388053-e883fedaadac?w=900&h=700&fit=crop&auto=format',
  photos: [],
  type: 'MATCH',
  category: 'TENIS_MESA',
  eventDate: '2026-09-24',
  status: 'PUBLISHED',
  isOfficial: true,
  organizationId: 1,
  location: 'Santiago, Chile',
  teamOneId: 101,
  teamTwoId: 102,
};

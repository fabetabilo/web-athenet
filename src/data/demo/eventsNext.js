import { allEvents } from './eventsAll'
import { daysFromToday } from './demoDates'

/**
 * Mock de /events/next, derivado del catalogo: los 10 proximos por fecha de inicio.
 */
export const nextEvents = allEvents
  .filter((event) => event.eventDate >= daysFromToday(0)).slice(0, 10)

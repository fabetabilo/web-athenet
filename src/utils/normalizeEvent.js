/**
 * normalizeEvent
 *
 * Convierte un payload crudo de ms-events en el shape canónico del front.
 * Esta función es la única fuente de verdad para el mapeo backend → front.
 * Ningún componente debe consumir el payload crudo directamente.
 *
 * @param {Object} rawEvent - Payload tal como llega de ms-events
 * @returns {NormalizedEvent} Objeto listo para consumo en componentes
 */

// ---------------------------------------------------------------------------
// Tablas de mapeo
/** @type {Record<string, string>} */
const CATEGORY_LABELS = {
  FUTBOL:               'Fútbol',
  BASQUETBOL:           'Basquetbol',
  VOLEIBOL:             'Vóleibol',
  AJEDREZ:              'Ajedrez',
  TENIS:                'Tenis',
  NATACION:             'Natación',
  FUTSAL:               'Futsal',
  VOLEIBOL_PLAYA:       'Vóleibol Playa',
  BALON_MANO:           'Balonmano',
  RUGBY:                'Rugby',
  JUDO:                 'Judo',
  KARATE:               'Karate',
  TAEKWONDO:            'Taekwondo',
  TENIS_MESA:           'Tenis de Mesa',
  GIMNASIA:             'Gimnasia',
  GIMNASIA_RITMICA:     'Gimnasia Rítmica',
  ESCALADA_DEPORTIVA:   'Escalada Deportiva',
  LEVANTAMIENTO_PESAS:  'Levantamiento de Pesas',
  CROSS_COUNTRY:        'Cross Country',
  ATLETISMO:            'Atletismo',
}

/** @type {Record<string, string>} */
const TYPE_LABELS = {
  MATCH:    'Partido',
  MEETING:  'Reunión',
  TRACKDAY: 'Track Day',
  OTHER:    'Otro',
}

/** @type {Record<string, string>} */
const STATUS_LABELS = {
  DRAFT:     'Borrador',
  PUBLISHED: 'Publicado',
  CANCELLED: 'Cancelado',
}

/** Nombres de mes en español, índice 0 = enero */
const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ---------------------------------------------------------------------------
// Utilidades de fecha
/**
 * Formatea un string ISO "YYYY-MM-DD" a un string legible en español chileno.
 * Usa el constructor Date(year, month-1, day) en lugar de new Date(isoString)
 * para evitar el desfase de timezone: new Date("YYYY-MM-DD") parsea como UTC
 * medianoche, lo que en Chile (UTC-3 / UTC-4) puede rendir el día anterior.
 *
 * @param {string} isoDate - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Ej: "4 de octubre de 2026"
 */
function formatEventDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-CL', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })
}

/**
 * Descompone un string ISO "YYYY-MM-DD" en las tres partes de display
 * que usa el diseño de EventCard: día, mes (nombre) y año.
 *
 * @param {string} isoDate
 * @returns {{ displayDay: string, displayMonth: string, displayYear: string }}
 */
function splitDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return {
    displayDay:   String(day),
    displayMonth: MONTH_NAMES_ES[month - 1],
    displayYear:  String(year),
  }
}

// ---------------------------------------------------------------------------
// Función principal
/**
 * @typedef {Object} NormalizedEvent
 * Identificación
 * @property {string}      id             - internalId del backend (usado en rutas y lookups)
 * Contenido
 * @property {string}      title
 * @property {string}      description
 * @property {string|null} descriptionOpt - description_opt del backend, null si ausente
 * Imagen
 * @property {string}      image          - alias de coverImage, para compatibilidad con componentes existentes
 * @property {string[]}    photos         - lista de fotos adicionales; [] si viene vacío o null
 * Fecha
 * @property {string}      eventDate      - ISO "YYYY-MM-DD", fuente de verdad para lógica de fechas
 * @property {string}      formattedDate  - fecha formateada en es-CL, para display en UI
 * @property {string}      displayDay     - número de día como string (ej. "4"), para layout de card
 * @property {string}      displayMonth   - nombre del mes en español (ej. "Octubre"), para layout de card
 * @property {string}      displayYear    - año como string (ej. "2026"), para layout de card
 * Clasificación
 * @property {string}      type           - enum original: MATCH | MEETING | TRACKDAY | OTHER
 * @property {string}      typeLabel      - label legible en español
 * @property {string}      category       - enum original: FUTBOL | BASQUETBOL | ...
 * @property {string}      categoryLabel  - label legible en español
 * Estado
 * @property {string}      status         - enum original: DRAFT | PUBLISHED | CANCELLED
 * @property {string}      statusLabel    - label legible en español
 * @property {boolean}     isVisible      - true solo si status === 'PUBLISHED'
 * Oficial
 * @property {boolean}     isOfficial     - true si el evento es verificado/oficial
 * Equipos
 * @property {boolean}     hasTeams       - true si teamOneId y teamTwoId son no-nulos
 *                                          Decisión de negocio: type=MATCH garantiza hasTeams=true.
 *                                          Otros tipos pueden tener equipos o no.
 * @property {number|null} teamOneId
 * @property {number|null} teamTwoId
 * Misc
 * @property {string|null} location
 * @property {string|null} address
 * @property {number}      organizationId
 */

/**
 * @param {Object} rawEvent
 * @returns {NormalizedEvent}
 */
export function normalizeEvent(rawEvent) {
  const hasTeams =
    rawEvent.teamOneId != null &&
    rawEvent.teamTwoId != null

  // Validación de consistencia (solo en desarrollo).
  // Regla de negocio: un evento MATCH siempre debe tener equipos asignados.
  // Este warn detecta payloads mal formados del backend sin romper la UI en producción.
  if (import.meta.env.DEV && rawEvent.type === 'MATCH' && !hasTeams) {
    console.warn(
      `[normalizeEvent] Inconsistencia: evento MATCH sin equipos — internalId: ${rawEvent.internalId}`
    )
  }

  return {
    // Identificación
    id: rawEvent.internalId,
    // Contenido
    title:          rawEvent.title,
    description:    rawEvent.description,
    descriptionOpt: rawEvent.description_opt ?? null,
    // Imagen
    image:  rawEvent.coverImage,
    photos: Array.isArray(rawEvent.photos) ? rawEvent.photos : [],
    // Fecha
    eventDate:     rawEvent.eventDate,
    formattedDate: formatEventDate(rawEvent.eventDate),
    ...splitDisplayDate(rawEvent.eventDate),
    // Clasificación
    type:          rawEvent.type,
    typeLabel:     TYPE_LABELS[rawEvent.type]     ?? rawEvent.type,
    category:      rawEvent.category,
    categoryLabel: CATEGORY_LABELS[rawEvent.category] ?? rawEvent.category,
    // Estado
    status:      rawEvent.status,
    statusLabel: STATUS_LABELS[rawEvent.status] ?? rawEvent.status,
    isVisible:   rawEvent.status === 'PUBLISHED',
    // Oficial
    isOfficial: Boolean(rawEvent.isOfficial),
    // Equipos
    hasTeams,
    teamOneId: rawEvent.teamOneId ?? null,
    teamTwoId: rawEvent.teamTwoId ?? null,
    // Misc
    location:       rawEvent.location ?? null,
    address:        rawEvent.address ?? null,
    organizationId: rawEvent.organizationId,
  }
}

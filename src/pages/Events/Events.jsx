import { useState, useEffect, useMemo } from 'react'
import { useTransitionNavigate, useTransitionHold } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import EventCard from '../../components/ui/EventCard/EventCard'
import Table, { TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table/Table'
import TeamMatchup from '../../components/ui/TeamChip/TeamMatchup'
import EventsBoard from '../../components/ui/EventsBoard/EventsBoard'
import FilterGroup from '../../components/ui/FilterGroup/FilterGroup'
import { FILTER_ALL as ALL, uniqueValues } from '../../components/ui/FilterGroup/filterUtils'
import { OfficialIconH } from '../../components/icons'
import { getAllEvents } from '../../service/eventsApi'
import styles from './Events.module.css'

// Estado de un evento segun las banderas que calcula normalizeEvent
const STATUS_OPTIONS = [
  { id: 'UPCOMING', label: 'Próximos' },
  { id: 'LIVE', label: 'En curso' },
  { id: 'FINISHED', label: 'Finalizados' },
]
const statusOf = (event) => (event.isFinished ? 'FINISHED' : event.hasStarted ? 'LIVE' : 'UPCOMING')

// Todo: filtro por competencia (copa, torneo, etc): los eventos demo aun no traen competitionId.

export default function Events() {
  const [publicEvents, setPublicEvents] = useState([])
  const [view, setView] = useState('grid')
  const [sport, setSport] = useState(ALL)
  const [type, setType] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [isLoading, setIsLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const navigate = useTransitionNavigate()

  useTransitionHold(isLoading)

  useEffect(() => {
    let isMounted = true
    getAllEvents()
      .then((events) => {
        if (isMounted) {
          setPublicEvents(events.filter((e) => e.isVisible))
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadFailed(true)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // opciones de cada filtro, sacadas de los eventos cargados
  const sportOptions = useMemo(
    () => uniqueValues(publicEvents, (e) => e.sportLabel).sort().map((value) => ({ id: value, label: value })),
    [publicEvents],
  )
  const typeOptions = useMemo(
    () => uniqueValues(publicEvents, (e) => e.typeLabel).map((value) => ({ id: value, label: value })),
    [publicEvents],
  )
  const statusOptions = useMemo(
    () => STATUS_OPTIONS.filter((option) => publicEvents.some((e) => statusOf(e) === option.id)),
    [publicEvents],
  )

  const visibleEvents = publicEvents.filter((e) => (
    (sport === ALL || e.sportLabel === sport)
    && (type === ALL || e.typeLabel === type)
    && (status === ALL || statusOf(e) === status)
  ))

  const hasFilters = sport !== ALL || type !== ALL || status !== ALL
  const clearFilters = () => {
    setSport(ALL)
    setType(ALL)
    setStatus(ALL)
  }

  return (
    <div className={styles.page}>
      <PageBanner
        title="Eventos"
        subtitle="Calendario de partidos, torneos y fechas clave del deporte universitario."
        backgroundImage={`${import.meta.env.BASE_URL}img/events.webp`}
      />

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.toolbar}>
            <FilterGroup label="Estado" allLabel="Todos" options={statusOptions} value={status} onChange={setStatus} />
            <FilterGroup label="Tipo" allLabel="Todos" options={typeOptions} value={type} onChange={setType} />
            <FilterGroup label="Deporte" allLabel="Todos" options={sportOptions} value={sport} onChange={setSport} />

            <div className={styles.viewToggle} role="radiogroup" aria-label="Cambiar vista">
              <label className={styles.viewOption}>
                <input
                  type="radio"
                  name="view"
                  value="grid"
                  checked={view === 'grid'}
                  onChange={() => setView('grid')}
                />
                GRID
              </label>
              <label className={styles.viewOption}>
                <input
                  type="radio"
                  name="view"
                  value="list"
                  checked={view === 'list'}
                  onChange={() => setView('list')}
                />
                LISTA
              </label>
            </div>
          </div>

          {loadFailed && <p className={styles.status}>No se pudieron cargar los eventos.</p>}

          {!isLoading && !loadFailed && visibleEvents.length === 0 && (
            <div className={styles.status}>
              <p>No hay eventos con esos filtros.</p>
              {hasFilters && (
                <button type="button" className={styles.clear} onClick={clearFilters}>Limpiar filtros</button>
              )}
            </div>
          )}

          {/* Vista grid */}
          {view === 'grid' && (
            <div className={styles.grid}>
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} showCountdown />
              ))}
            </div>
          )}
          {/* Vista lista (tabla) */}
          {view === 'list' && (
            <Table minWidth="54rem" label="Listado de eventos">
              <TableHead>
                <TableRow>
                  <TableHeadCell>DEPORTE</TableHeadCell>
                  <TableHeadCell>EVENTO</TableHeadCell>
                  <TableHeadCell>ENCUENTRO</TableHeadCell>
                  <TableHeadCell>CIUDAD</TableHeadCell>
                  <TableHeadCell>FECHA</TableHeadCell>
                  {/** por ahora OFICIAL, mas adelante implementarlo como "ORGANIZA" para diferentes instituciones o entidades diferentes a Athenet */}
                  <TableHeadCell align="center" width="7rem">OFICIAL</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleEvents.map((event) => (
                  <TableRow key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
                    <TableCell>{event.sportLabel || '-'}</TableCell>
                    <TableCell variant="strong">{event.title}</TableCell>
                    <TableCell>
                      {event.hasTeams ? <TeamMatchup event={event} /> : '-'}
                    </TableCell>
                    <TableCell>{event.location || '-'}</TableCell>
                    <TableCell variant="muted">{event.formattedDate}</TableCell>
                    <TableCell align="center">
                      {event.isOfficial && (
                        <OfficialIconH className={styles.officialBadge} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
      <EventsBoard />
    </div>
  )
}

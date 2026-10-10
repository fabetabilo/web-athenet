import { useState, useEffect } from 'react'
import { useTransitionNavigate, useTransitionHold } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import EventCard from '../../components/ui/EventCard/EventCard'
import Table, { TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table/Table'
import TeamMatchup from '../../components/ui/TeamChip/TeamMatchup'
import { OfficialIconH } from '../../components/icons'
import { getAllEvents } from '../../service/eventsApi'
import styles from './Events.module.css'

// Todo: FILTROS. Filtro por categoria, por competencia (copa, torneo, etc) y otros.

export default function Events() {
  const [publicEvents, setPublicEvents] = useState([])
  const [view, setView] = useState('grid')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useTransitionNavigate()

  useTransitionHold(isLoading)

  useEffect(() => {
    let isMounted = true
    getAllEvents().then((events) => {
      if (isMounted) {
        setPublicEvents(events.filter((e) => e.isVisible))
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className={styles.page}>
      <PageBanner
        title="EVENTOS"
        backgroundImage="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
      />

      <section className={styles.content}>
        <div className={styles.container}>

          {/* Toolbar: contador de eventos + toggle de vista */}
          <div className={styles.toolbar}>
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

          {/* Vista grid */}
          {view === 'grid' && (
            <div className={styles.grid}>
              {publicEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {/* Vista lista (tabla) */}
          {view === 'list' && (
            <Table minWidth="54rem" label="Listado de eventos">
              <TableHead>
                <TableRow>
                  <TableHeadCell>CATEGORÍA</TableHeadCell>
                  <TableHeadCell>EVENTO</TableHeadCell>
                  <TableHeadCell>ENCUENTRO</TableHeadCell>
                  <TableHeadCell>CIUDAD</TableHeadCell>
                  <TableHeadCell>FECHA</TableHeadCell>
                  {/** por ahora OFICIAL, mas adelante implementarlo como "ORGANIZA" para diferentes instituciones o entidades diferentes a Athenet */}
                  <TableHeadCell align="center" width="7rem">OFICIAL</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publicEvents.map((event) => (
                  <TableRow key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
                    <TableCell>{event.categoryLabel}</TableCell>
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
    </div>
  )
}

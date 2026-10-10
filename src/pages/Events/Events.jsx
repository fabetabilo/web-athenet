import { useState, useEffect } from 'react'
import { useTransitionNavigate, useTransitionHold } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import EventCard from '../../components/ui/EventCard/EventCard'
import ButtonAction from '../../components/ui/Button/ButtonAction'
import { OfficialIconH, ArrowRight } from '../../components/icons'
import { getAllEvents } from '../../service/eventsApi'
import styles from './Events.module.css'

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
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>CATEGORÍA</th>
                    <th>NOMBRE</th>
                    <th>CIUDAD</th>
                    <th>FECHA</th>
                    <th>OFICIAL</th>
                    <th>IR A EVENTO</th>
                  </tr>
                </thead>
                <tbody>
                  {publicEvents.map((event) => (
                    <tr
                      key={event.id}
                      className={styles.clickableRow}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <td className={styles.categoryCell}>{event.categoryLabel}</td>
                      <td className={styles.nameCell}>{event.title}</td>
                      <td className={styles.cityCell}>{event.location || '-'}</td>
                      <td className={styles.dateCell}>{event.formattedDate}</td>
                      <td className={styles.badgeCell}>
                        {event.isOfficial && (
                          <OfficialIconH className={styles.officialBadge} />
                        )}
                      </td>
                      <td className={styles.actionCell}>
                        <ButtonAction
                          icon={ArrowRight}
                          aria-label={`Ver detalles de ${event.title}`}
                          onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

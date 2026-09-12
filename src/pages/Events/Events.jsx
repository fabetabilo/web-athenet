import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import EventCard from '../../components/ui/EventCard/EventCard'
import ViewToggle from '../../components/ui/ViewToggle/ViewToggle'
import ButtonAction from '../../components/ui/Button/ButtonAction'
import { OfficialIconH, ArrowRight } from '../../components/ui/icons'
import { allEvents } from '../../data/allEvents'
import { normalizeEvent } from '../../utils/normalizeEvent'
import styles from './Events.module.css'

/**
 * Opciones de vista disponibles.
 */
const VIEW_OPTIONS = [
  { value: 'grid', label: 'GRID' },
  { value: 'list', label: 'LISTA' },
]

// Normalizar y filtrar solo eventos visibles (status PUBLISHED)
const publicEvents = allEvents.map(normalizeEvent).filter((e) => e.isVisible)

export default function Events() {
  const [view, setView] = useState('grid')
  const navigate = useNavigate()

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
            <ViewToggle
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
            />
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

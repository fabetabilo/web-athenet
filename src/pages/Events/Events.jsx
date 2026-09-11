import { useState } from 'react'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import EventCard from '../../components/ui/EventCard/EventCard'
import ViewToggle from '../../components/ui/ViewToggle/ViewToggle'
import { allEvents } from '../../data/allEvents'
import { normalizeEvent } from '../../utils/normalizeEvent'
import styles from './Events.module.css'

/**
 * Opciones de vista disponibles.
 * Agregar { value: 'list', label: 'LISTA' } cuando se implemente la vista tabla.
 */
const VIEW_OPTIONS = [
  { value: 'grid', label: 'GRID' },
]

// Normalizar y filtrar solo eventos visibles (status PUBLISHED)
const publicEvents = allEvents.map(normalizeEvent).filter((e) => e.isVisible)

export default function Events() {
  const [view, setView] = useState('grid')

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

          {/* view === 'list' → implementar aquí en el futuro */}

        </div>
      </section>
    </div>
  )
}

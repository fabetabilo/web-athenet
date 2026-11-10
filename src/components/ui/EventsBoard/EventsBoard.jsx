import { useEffect, useState } from 'react'
import { TransitionLink, useTransitionNavigate } from '../../transition'
import Table, { TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '../Table/Table'
import TeamMatchup from '../TeamChip/TeamMatchup'
import { OfficialIconH } from '../../icons'
import { getNextEvents } from '../../../service/eventsApi'
import { formatDateRange } from '../../../utils/dateTime'
import logo from '../../../assets/icon/brand2.png'
import styles from './EventsBoard.module.css'

const BACKGROUND = 'https://plus.unsplash.com/premium_photo-1684713510655-e6e31536168d?q=80&w=1170&auto=format&fit=crop'

function eventsRange(events) {
  if (events.length === 0) return ''

  let start = events[0].eventDate
  let end = events[0].endDate || events[0].eventDate

  for (const event of events) {
    if (event.eventDate < start) start = event.eventDate
    const last = event.endDate || event.eventDate
    if (last > end) end = last
  }

  return formatDateRange(start, end)
}

export default function EventsBoard() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading')
  const navigate = useTransitionNavigate()
  const range = eventsRange(events)

  useEffect(() => {
    let isMounted = true
    getNextEvents()
      .then((list) => {
        if (!isMounted) return
        setEvents(list.filter((e) => e.isVisible))
        setStatus('ready')
      })
      .catch(() => {
        if (isMounted) setStatus('error')
      })
    return () => {
      isMounted = false
    }
  }, [])

  const emptyMessage =
    status === 'error'
      ? 'No se pudieron cargar los eventos.'
      : status === 'ready' && events.length === 0
        ? 'No hay eventos próximos por ahora.'
        : null

  return (
    <section className={styles.board}>
      <img src={BACKGROUND} alt="" aria-hidden="true" className={styles.bg} decoding="async" />
      <div className={styles.fade} />

      <div className={styles.inner}>
        <h2 className={styles.title}>Siguientes eventos</h2>
        <p className={styles.range}>{range}</p>

        <div className={styles.panel}>
          <div className={styles.toolbar}>
            <img src={logo} alt="Athenet" className={styles.logo} />
          </div>

          <Table minWidth="54rem" label="Siguientes eventos" className={styles.table} aria-busy={status === 'loading'}>
            <TableHead>
              <TableRow>
                <TableHeadCell>DEPORTE</TableHeadCell>
                <TableHeadCell>EVENTO</TableHeadCell>
                <TableHeadCell>ENCUENTRO</TableHeadCell>
                <TableHeadCell>CIUDAD</TableHeadCell>
                <TableHeadCell>FECHA</TableHeadCell>
                <TableHeadCell align="center" width="7rem">OFICIAL</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
                  <TableCell>{event.sportLabel || '-'}</TableCell>
                  <TableCell variant="strong">{event.title}</TableCell>
                  <TableCell>{event.hasTeams ? <TeamMatchup event={event} /> : '-'}</TableCell>
                  <TableCell>{event.location || '-'}</TableCell>
                  <TableCell variant="muted">{event.formattedDate}</TableCell>
                  <TableCell align="center">
                    {event.isOfficial && <OfficialIconH className={styles.officialBadge} />}
                  </TableCell>
                </TableRow>
              ))}
              {emptyMessage && (
                <TableRow>
                  <TableCell colSpan={6} align="center" variant="muted">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TransitionLink to="/events" className={styles.cta}>
          Ver todos los eventos
        </TransitionLink>
      </div>
    </section>
  )
}

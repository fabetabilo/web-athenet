import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TransitionLink, useTransitionHold } from '../../components/transition'
import { Calendar, ChevronLeft, MapPin } from '../../components/icons'
import Pill from '../../components/ui/Pill/Pill'
import Bracket from '../../components/ui/Bracket/Bracket'
import { getCompetitionById, getCompetitionMatches } from '../../service/competitionsApi'
import { formatDateRange } from '../../utils/dateTime'
import styles from './Competition.module.css'

const STATUS_PILLS = {
  IN_PROGRESS: { label: 'En curso', variant: 'red' },
  SCHEDULED: { label: 'Próxima', variant: 'neutral' },
  FINISHED: { label: 'Finalizada', variant: 'neutral' },
}

// el ms no trae sede de la competencia: sale de los partidos de la llave
function venueLabel(matches) {
  const venues = new Set(matches.map((m) => m.location).filter(Boolean))
  if (venues.size === 0) return null
  return venues.size === 1 ? [...venues][0] : 'Varias sedes'
}

const formatDay = (iso) => formatDateRange(iso, iso)

export default function CompetitionDetail() {
  const { id } = useParams()
  const [competition, setCompetition] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useTransitionHold(loading)

  useEffect(() => {
    let mounted = true

    getCompetitionById(id)
      .then(async (data) => {
        // la llave solo existe en las copas; si falla, la pagina igual se muestra sin ella
        const fixture = data?.type === 'CUP' ? await getCompetitionMatches(id).catch(() => []) : []
        return { data, fixture }
      })
      .then(({ data, fixture }) => {
        if (!mounted) return
        setCompetition(data)
        setMatches(fixture)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setLoadFailed(true)
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <main className={styles.message}><h1>Cargando competencia...</h1></main>
  }

  if (loadFailed) {
    return (
      <main className={styles.message}>
        <h1>No se pudo cargar la competencia.</h1>
        <TransitionLink to="/">Volver al inicio</TransitionLink>
      </main>
    )
  }

  if (!competition) {
    return (
      <main className={styles.message}>
        <h1>Competencia no encontrada</h1>
        <TransitionLink to="/">Volver al inicio</TransitionLink>
      </main>
    )
  }

  const showBracket = competition.type === 'CUP' && matches.length > 0
  const status = STATUS_PILLS[competition.status] ?? STATUS_PILLS.FINISHED
  const venue = venueLabel(matches)
  const { startDate, endDate } = competition
  const dateLine = startDate && endDate ? formatDateRange(startDate, endDate) : competition.dateLabel

  return (
    <main className={styles.page}>
      <header className={styles.banner}>
        {competition.competitionImg && (
          <>
            <div className={styles.backdrop} style={{ backgroundImage: `url(${competition.competitionImg})` }} />
            <img src={competition.competitionImg} alt="" className={styles.poster} />
          </>
        )}
        <div className={styles.overlay} />

        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <TransitionLink to="/competitions" className={styles.backLink}>
              <ChevronLeft className={styles.backLinkIcon} />
              Todas las competencias
            </TransitionLink>

            <div className={styles.bannerTop}>
              {competition.sportLabel && <Pill>{competition.sportLabel}</Pill>}
              <Pill variant={status.variant}>{status.label}</Pill>
            </div>

            <h1 className={styles.title}>{competition.name}</h1>

            <p className={styles.meta}>
              {venue && (
                <>
                  <MapPin size={24} strokeWidth={1} aria-hidden="true" />
                  {venue}
                  <span className={styles.dateSep} aria-hidden="true">|</span>
                </>
              )}
              <span>{dateLine}</span>
            </p>

            {competition.description && <p className={styles.subtitle}>{competition.description}</p>}
          </div>

          {(startDate || endDate) && (
            <div className={styles.bannerFooter}>
              {startDate && (
                <div className={styles.footerItem}>
                  <Calendar className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Inicio</span>
                  <span className={styles.itemText}>{formatDay(startDate)}</span>
                </div>
              )}
              {endDate && (
                <div className={styles.footerItem}>
                  <Calendar className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Término</span>
                  <span className={styles.itemText}>{formatDay(endDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showBracket && <Bracket matches={matches} title="Llaves" />}

      {competition.type === 'CUP' && !showBracket && (
        <section className={styles.content}>
          <div className={styles.container}>
            <p className={styles.description}>La llave de esta copa aún no está disponible.</p>
          </div>
        </section>
      )}
    </main>
  )
}

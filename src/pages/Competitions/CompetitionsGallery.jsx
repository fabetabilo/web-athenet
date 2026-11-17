import { useEffect, useMemo, useState } from 'react'
import { useTransitionHold, useTransitionNavigate } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import CompetitionBanner from '../../components/ui/CompetitionBanner/CompetitionBanner'
import Table, { TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table/Table'
import FilterGroup from '../../components/ui/FilterGroup/FilterGroup'
import { FILTER_ALL as ALL, uniqueValues } from '../../components/ui/FilterGroup/filterUtils'
import { getCompetitions } from '../../service/competitionsApi'
import styles from './CompetitionsGallery.module.css'

// Vistas, como en Eventos: grid (banners anchos) y lista (tabla)
const VIEWS = [
  { id: 'grid', label: 'GRID' },
  { id: 'list', label: 'LISTA' },
]

const STATUS_LABELS = { IN_PROGRESS: 'En curso', SCHEDULED: 'Próxima', FINISHED: 'Finalizada' }
const TYPE_LABELS = { CUP: 'Copa', LEAGUE: 'Liga' }

// Orden de los grupos y su titulo; una competencia sin estado conocido cae en "Finalizadas"
const STATUS_GROUPS = [
  { id: 'IN_PROGRESS', title: 'En curso' },
  { id: 'SCHEDULED', title: 'Próximas' },
  { id: 'FINISHED', title: 'Finalizadas' },
]

const statusOf = (competition) => (
  STATUS_GROUPS.some((group) => group.id === competition.status) ? competition.status : 'FINISHED'
)

/** Ruta /competitions: listado de competencias con filtros por deporte, estado y temporada. */
export default function CompetitionsGallery() {
  const [competitions, setCompetitions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [sport, setSport] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [season, setSeason] = useState(ALL)
  const [view, setView] = useState('grid')
  const navigate = useTransitionNavigate()

  useTransitionHold(isLoading)

  useEffect(() => {
    let isMounted = true
    getCompetitions()
      .then((list) => {
        if (!isMounted) return
        setCompetitions(list)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        setLoadFailed(true)
        setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // opciones de cada filtro, sacadas de los datos
  const sportOptions = useMemo(
    () => uniqueValues(competitions, (c) => c.sportLabel).map((value) => ({ id: value, label: value })),
    [competitions],
  )
  const statusOptions = useMemo(
    () => STATUS_GROUPS
      .filter((group) => competitions.some((c) => statusOf(c) === group.id))
      .map((group) => ({ id: group.id, label: group.title })),
    [competitions],
  )
  const seasonOptions = useMemo(
    () => uniqueValues(competitions, (c) => c.season).sort().reverse().map((value) => ({ id: value, label: value })),
    [competitions],
  )

  const filtered = competitions.filter((c) => (
    (sport === ALL || c.sportLabel === sport)
    && (status === ALL || statusOf(c) === status)
    && (season === ALL || c.season === season)
  ))

  // ya vienen ordenadas: se agrupan por estado sin los grupos vacios
  const groups = STATUS_GROUPS
    .map((group) => ({ ...group, items: filtered.filter((c) => statusOf(c) === group.id) }))
    .filter((group) => group.items.length > 0)

  const hasFilters = sport !== ALL || status !== ALL || season !== ALL
  const clearFilters = () => {
    setSport(ALL)
    setStatus(ALL)
    setSeason(ALL)
  }

  return (
    <div className={styles.page}>
      <PageBanner
        title="Competencias"
        subtitle="Copas, ligas y torneos del deporte universitario: sigue la llave y los resultados de cada uno."
        backgroundImage={`${import.meta.env.BASE_URL}img/competitions.webp`}
      />

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.toolbar}>
            <FilterGroup label="Deporte" allLabel="Todos" options={sportOptions} value={sport} onChange={setSport} />
            <FilterGroup label="Estado" allLabel="Todas" options={statusOptions} value={status} onChange={setStatus} />
            <FilterGroup label="Temporada" allLabel="Todas" options={seasonOptions} value={season} onChange={setSeason} />

            <div className={styles.viewToggle} role="radiogroup" aria-label="Cambiar vista">
              {VIEWS.map((item) => (
                <label key={item.id} className={styles.viewOption}>
                  <input
                    type="radio"
                    name="view"
                    value={item.id}
                    checked={view === item.id}
                    onChange={() => setView(item.id)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {loadFailed && <p className={styles.status}>No se pudieron cargar las competencias.</p>}

          {!isLoading && !loadFailed && groups.length === 0 && (
            <div className={styles.status}>
              <p>No hay competencias con esos filtros.</p>
              {hasFilters && (
                <button type="button" className={styles.clear} onClick={clearFilters}>Limpiar filtros</button>
              )}
            </div>
          )}

          {/* Vista lista (tabla): una sola tabla, el estado va en su columna */}
          {view === 'list' && filtered.length > 0 && (
            <Table minWidth="48rem" label="Listado de competencias">
              <TableHead>
                <TableRow>
                  <TableHeadCell>DEPORTE</TableHeadCell>
                  <TableHeadCell>COMPETENCIA</TableHeadCell>
                  <TableHeadCell>TIPO</TableHeadCell>
                  <TableHeadCell>TEMPORADA</TableHeadCell>
                  <TableHeadCell>FECHAS</TableHeadCell>
                  <TableHeadCell>ESTADO</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.flatMap((group) => group.items).map((competition) => (
                  <TableRow
                    key={competition.id}
                    // solo las que tienen contenido llevan al detalle
                    onClick={competition.hasDetail ? () => navigate(`/competitions/${competition.id}`) : undefined}
                  >
                    <TableCell>{competition.sportLabel || '-'}</TableCell>
                    <TableCell variant="strong">{competition.name}</TableCell>
                    <TableCell>{TYPE_LABELS[competition.type] ?? '-'}</TableCell>
                    <TableCell>{competition.season || '-'}</TableCell>
                    <TableCell variant="muted">{competition.dateLabel}</TableCell>
                    <TableCell>{STATUS_LABELS[statusOf(competition)]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {view !== 'list' && groups.map((group) => (
            <section key={group.id} className={styles.group} aria-labelledby={`group-${group.id}`}>
              <h2 id={`group-${group.id}`} className={styles.groupTitle}>
                {group.title}
              </h2>
              <ul className={styles.bannerGrid}>
                {group.items.map((competition) => (
                  <li key={competition.id}>
                    <CompetitionBanner competition={competition} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}

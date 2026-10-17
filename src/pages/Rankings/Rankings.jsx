import { Fragment, useEffect, useState } from 'react'
import { useTransitionHold } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import Table, { TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table/Table'
import { getTeamCompetitions } from '../../service/competitionsApi'
import { formatNumericDate, getLastUpdate } from '../../utils/normalizeRanking'
import { getRankingHistorico, getRankingSports } from '../../service/rankingApi'
import styles from './Rankings.module.css'

function Avatar({ src, name, size = 'md' }) {
  return (
    <span className={`${styles.avatar} ${styles[`avatar_${size}`]}`}>
      {src
        ? <img src={src} alt="" className={styles.avatarImg} />
        : <span className={styles.avatarInitial} aria-hidden="true">{name.charAt(0)}</span>}
    </span>
  )
}

function LastMatch({ match }) {
  if (!match) return <span className={styles.empty}>Sin partidos</span>

  return (
    <div className={styles.match}>
      {['home', 'away'].map((side) => {
        const { team, score } = match[side]
        const isLoser = match.winner && match.winner !== side
        return (
          <div key={side} className={styles.matchSide}>
            <Avatar src={team.logo} name={team.name} size="xs" />
            <span className={`${styles.matchName} ${match.winner === side ? styles.winner : ''} ${isLoser ? styles.loser : ''}`}>
              {team.name}
            </span>
            <span className={styles.score}>{score ?? '-'}</span>
          </div>
        )
      })}
    </div>
  )
}

function CompetitionsPanel({ entry }) {
  if (!entry || entry.status === 'loading') {
    return <p className={styles.panelMessage}>Cargando competencias…</p>
  }
  if (entry.items.length === 0) {
    return <p className={styles.panelMessage}>Este equipo aún no participa en competencias.</p>
  }

  return (
    <ul className={styles.compList}>
      {entry.items.map((competition) => (
        <li key={competition.id} className={styles.compCard}>
          <Avatar src={competition.logo} name={competition.name} size="lg" />
          <span className={styles.compText}>
            <span className={styles.compName}>{competition.name}</span>
            <span className={styles.compDate}>{competition.dateLabel}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function Rankings() {
  const [sports, setSports] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [data, setData] = useState({ key: null, rows: [] })
  const [expandedId, setExpandedId] = useState(null)
  const [competitionsByTeam, setCompetitionsByTeam] = useState({})

  const activeSport = sports?.find((sport) => (selectedKey ?? sports[0]?.key) === sport.key) ?? null
  const isLoading = sports === null || (activeSport !== null && data.key !== activeSport.key)
  const rows = data.key === activeSport?.key ? data.rows : []
  const lastUpdate = getLastUpdate(rows)

  useTransitionHold(isLoading && data.key === null)

  useEffect(() => {
    let isMounted = true
    getRankingSports().then((list) => {
      if (isMounted) setSports(list)
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!activeSport) return undefined
    let isMounted = true
    getRankingHistorico(activeSport)
      .catch(() => [])
      .then((list) => {
        if (isMounted) setData({ key: activeSport.key, rows: list })
      })
    return () => {
      isMounted = false
    }
  }, [activeSport])

  const handleToggle = (row) => {
    if (expandedId === row.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(row.id)
    if (competitionsByTeam[row.id]) return

    setCompetitionsByTeam((prev) => ({ ...prev, [row.id]: { status: 'loading', items: [] } }))
    getTeamCompetitions(row.id)
      .catch(() => [])
      .then((items) => {
        setCompetitionsByTeam((prev) => ({ ...prev, [row.id]: { status: 'ready', items } }))
      })
  }

  return (
    <div className={styles.page}>
      <PageBanner
        title="RANKINGS"
        backgroundImage="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
      />

      <section className={styles.content}>
        <div className={styles.container}>

          <div className={styles.toolbar}>
            <div className={styles.filter} role="group" aria-label="Filtrar por deporte">
              {(sports ?? []).map((sport) => (
                <button
                  key={sport.key}
                  type="button"
                  aria-pressed={sport.key === activeSport?.key}
                  className={`${styles.filterBtn} ${sport.key === activeSport?.key ? styles.filterBtnActive : ''}`}
                  onClick={() => {
                    setSelectedKey(sport.key)
                    setExpandedId(null)
                  }}
                >
                  {sport.label}
                </button>
              ))}
            </div>

            {lastUpdate && (
              <p className={styles.updated}>
                Última actualización del ranking: <time dateTime={lastUpdate}>{formatNumericDate(lastUpdate)}</time>
              </p>
            )}
          </div>

          <div className={isLoading ? styles.busy : undefined} aria-busy={isLoading}>
            <Table
              minWidth="66rem"
              label={`Ranking histórico${activeSport ? ` de ${activeSport.label}` : ''}`}
              className={styles.table}
            >
              <TableHead>
                <TableRow>
                  <TableHeadCell align="center" width="6rem">RANKING</TableHeadCell>
                  <TableHeadCell>EQUIPO</TableHeadCell>
                  <TableHeadCell>INSTITUCIÓN</TableHeadCell>
                  <TableHeadCell>ÚLTIMO PARTIDO</TableHeadCell>
                  <TableHeadCell align="center" width="7rem">PUNTOS</TableHeadCell>
                  <TableHeadCell align="center" width="8rem" title="Ganados - Perdidos">RÉCORD</TableHeadCell>
                  <TableHeadCell align="center" width="3.5rem">
                    <span className={styles.srOnly}>Ver competencias</span>
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const isOpen = expandedId === row.id
                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        onClick={() => handleToggle(row)}
                        aria-expanded={isOpen}
                        className={isOpen ? styles.rowOpen : ''}
                      >
                        <TableCell align="center">
                          <span className={styles.rank}>{row.position}</span>
                        </TableCell>
                        <TableCell>
                          <span className={styles.entity}>
                            <Avatar src={row.team.logo} name={row.team.name} size="lg" />
                            <span className={styles.teamName}>{row.team.name}</span>
                          </span>
                        </TableCell>
                        <TableCell variant="muted">
                          <span className={styles.entity}>
                            <Avatar src={row.institution.logo} name={row.institution.name} size="md" />
                            <span className={styles.institutionName}>{row.institution.name}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <LastMatch match={row.lastMatch} />
                        </TableCell>
                        <TableCell align="center" variant="strong">
                          <span className={styles.points}>{row.points}</span>
                        </TableCell>
                        <TableCell align="center">
                          <span className={styles.record}>{row.wins}-{row.losses}</span>
                        </TableCell>
                        <TableCell align="center">
                          <span className={styles.toggle} aria-hidden="true">{isOpen ? '–' : '+'}</span>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={7} className={styles.detailCell}>
                            <h3 className={styles.detailTitle}>Últimas competencias</h3>
                            <CompetitionsPanel entry={competitionsByTeam[row.id]} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" variant="muted">
                      Aún no hay resultados para este deporte.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  )
}

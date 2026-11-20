import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TransitionLink, useTransitionHold } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import Pill from '../../components/ui/Pill/Pill'
import Bracket from '../../components/ui/Bracket/Bracket'
import { getCompetitionById, getCompetitionMatches } from '../../service/competitionsApi'
import styles from './Competition.module.css'

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

  // con llave, el recuadro de la llave sube directo bajo el banner y el deporte va junto a su titulo
  const showBracket = competition.type === 'CUP' && matches.length > 0

  return (
    <main className={styles.page}>
      <div className={styles.banner}>
        <PageBanner
          title={competition.name}
          subtitle={competition.description}
          backgroundImage={competition.competitionImg}
          posterImage={competition.competitionImg}
        />
      </div>

      {showBracket ? (
        <Bracket
          matches={matches}
          title="Llaves"
          aside={competition.sportLabel && <Pill>{competition.sportLabel}</Pill>}
        />
      ) : (
        <section className={styles.content}>
          <div className={styles.container}>
            {competition.sportLabel && <Pill>{competition.sportLabel}</Pill>}
            {competition.type === 'CUP' && (
              <p className={styles.description}>La llave de esta copa aún no está disponible.</p>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

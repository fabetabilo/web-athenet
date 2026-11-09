import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TransitionLink, useTransitionHold } from '../../components/transition'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import Pill from '../../components/ui/Pill/Pill'
import { getCompetitionById } from '../../service/competitionsApi'
import styles from './Competition.module.css'

export default function CompetitionDetail() {
  const { id } = useParams()
  const [competition, setCompetition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useTransitionHold(loading)

  useEffect(() => {
    let mounted = true

    getCompetitionById(id)
      .then((data) => {
        if (!mounted) return
        setCompetition(data)
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

  return (
    <main className={styles.page}>
      <div className={styles.banner}>
        <PageBanner
          title={competition.name}
          subtitle={competition.description}
          backgroundImage={competition.competitionImg}
        />
      </div>

      <section className={styles.content}>
        <div className={styles.container}>
          {competition.sportLabel && <Pill>{competition.sportLabel}</Pill>}
        </div>
      </section>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TransitionLink, useTransitionHold } from '../../components/transition'
import { ChevronLeft } from '../../components/icons'
import { getMatchById } from '../../service/competitionsApi'
import LiveMatchView from './LiveMatchView'
import styles from './Match.module.css'

/** Ruta /partidos/:id. Busca el partido en el fixture vigente y monta la vista en vivo. */
export default function MatchDetail() {
  const { id } = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useTransitionHold(loading)

  useEffect(() => {
    let mounted = true

    getMatchById(id)
      .then((found) => {
        if (!mounted) return
        setMatch(found)
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

  const backLink = (
    <TransitionLink to="/" className={styles.back}>
      <ChevronLeft aria-hidden="true" />
      Inicio
    </TransitionLink>
  )

  // con partido, el banner de LiveMatchView lleva el enlace de vuelta y la foto
  if (!loading && !loadFailed && match && !match.isPending) {
    return (
      <main className={styles.page}>
        {/* la key reinicia el estado en vivo si se pasa de un partido a otro */}
        <LiveMatchView key={match.id} match={match} backLink={backLink} />
      </main>
    )
  }

  let message = 'Cargando partido…'
  if (loadFailed) message = 'No se pudo cargar el partido.'
  else if (!loading && !match) message = 'Partido no encontrado.'
  else if (!loading && match?.isPending) message = 'Los equipos de este partido aún no están definidos.'

  // sin banner: franja oscura detras del navbar y enlace de vuelta sobre fondo claro
  return (
    <main className={`${styles.page} ${styles.pageMessage}`}>
      <div className={styles.container}>
        {backLink}
        <p className={styles.message}>{message}</p>
      </div>
    </main>
  )
}

import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight, Building2, ChevronLeft, MapPin, Users } from '../../components/ui/icons'
import { getInstitutionById } from '../../service/institutionsApi'
import styles from './InstitutionDetail.module.css'

export default function InstitutionDetail() {
  const { id } = useParams()
  const [institution, setInstitution] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getInstitutionById(id).then((data) => {
      if (mounted) {
        setInstitution(data)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <main className={styles.notFound}><h1>Cargando institución...</h1></main>
  }

  if (!institution) {
    return (
      <main className={styles.notFound}>
        <h1>Institución no encontrada</h1>
        <Link to="/institutions">Volver a instituciones</Link>
      </main>
    )
  }

  const stats = [
    { label: 'Equipos', value: institution.teams, icon: Users },
    { label: 'Sedes', value: institution.sedes.length, icon: Building2 },
    { label: 'Disciplinas', value: institution.disciplines.length, icon: Users },
    { label: 'Ciudad', value: institution.city, icon: MapPin },
  ]

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/institutions" className={styles.backLink}>
            <ChevronLeft aria-hidden="true" /> Todas las instituciones
          </Link>
          <div className={styles.heroContent}>
            <div>
              <span className={styles.eyebrow}>INSTITUCIÓN ATHENET</span>
              <h1>{institution.name}</h1>
              <p>{institution.description}</p>
            </div>
            <div className={styles.logoPanel}>
              {institution.image ? (
                <img src={institution.image} alt={`Logo de ${institution.name}`} />
              ) : (
                <span className={styles.logoFallback} aria-hidden="true">{institution.acronym}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statsInner}>
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className={styles.stat}>
                <Icon aria-hidden="true" />
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.dashboard}>
        <article className={styles.announcements}>
          <div className={styles.sectionLabel}>ANUNCIOS</div>
          <div className={styles.announcementBody}>
            <span className={styles.liveDot}>{institution.active ? 'ACTIVA' : 'INACTIVA'}</span>
            <h2>La comunidad deportiva se mueve en {institution.city}.</h2>
            <p>{institution.sedes.length ? `${institution.sedes.length} sede${institution.sedes.length === 1 ? '' : 's'} registrada${institution.sedes.length === 1 ? '' : 's'} en el microservicio.` : 'Aun no hay sedes registradas.'}</p>
            <Link to="/institutions" className={styles.actionLink}>Volver al listado <ArrowRight aria-hidden="true" /></Link>
          </div>
        </article>

        <div className={styles.infoGrid}>
          <article className={styles.infoCard}>
            <span className={styles.cardKicker}>SEDES REGISTRADAS</span>
            <h2>{institution.sedes.map((sede) => sede.nombre).join(' / ') || 'Sin sedes'}</h2>
            <span className={styles.cardMeta}><Building2 aria-hidden="true" /> Ubicaciones de la institución</span>
          </article>
          <article className={styles.infoCard + ' ' + styles.accentCard}>
            <span className={styles.cardKicker}>SEDE PRINCIPAL</span>
            <h2>{institution.city}</h2>
            <span className={styles.cardMeta}><MapPin aria-hidden="true" /> Ubicación registrada</span>
          </article>
          <article className={styles.infoCard}>
            <span className={styles.cardKicker}>DISCIPLINAS</span>
            <h2>{institution.disciplines.join(' / ') || 'Sin disciplinas'}</h2>
            <span className={styles.cardMeta}><Users aria-hidden="true" /> Disciplinas de sus equipos</span>
          </article>
          <article className={styles.infoCard + ' ' + styles.darkCard}>
            <span className={styles.cardKicker}>SIGLA</span>
            <h2>{institution.acronym}</h2>
            <span className={styles.cardMeta}>Identificador institucional</span>
          </article>
        </div>
      </section>
    </main>
  )
}
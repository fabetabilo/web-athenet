import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import { getInstitutions } from '../../service/institutionsApi'
import styles from './Institutions.module.css'

export default function Institutions() {
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getInstitutions().then((data) => {
      if (mounted) {
        setInstitutions(data)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className={styles.page}>
      <PageBanner
        title="INSTITUCIONES"
        backgroundImage="https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=2070&auto=format&fit=crop"
      />

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.heading}>
            <div>
              <span className={styles.eyebrow}>COMUNIDAD ATHENET</span>
              <h2 className={styles.title}>Encuentra tu institución</h2>
            </div>
            <p className={styles.description}>
              Explora las casas de estudio que forman parte de la comunidad deportiva universitaria.
            </p>
          </div>

          {loading && <p className={styles.status}>Cargando instituciones...</p>}

          {!loading && institutions.length === 0 && (
            <p className={styles.status}>No hay instituciones disponibles.</p>
          )}

          <div className={styles.grid}>
            {institutions.map((institution) => (
              <Link
                key={institution.id}
                to={`/institutions/${institution.id}`}
                className={styles.card}
              >
                <div className={styles.logoWrapper}>
                  {institution.image ? (
                    <img src={institution.image} alt={`Logo de ${institution.name}`} className={styles.logo} />
                  ) : (
                    <span className={styles.logoFallback} aria-hidden="true">{institution.acronym}</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.campus}>{institution.acronym} / {institution.city}</span>
                  <h3>{institution.name}</h3>
                  <span className={styles.viewLink}>Ver institución <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
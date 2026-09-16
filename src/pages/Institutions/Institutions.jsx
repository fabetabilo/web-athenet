import { Link } from 'react-router-dom'
import PageBanner from '../../components/ui/PageBanner/PageBanner'
import { institutions } from '../../data/institutions'
import styles from './Institutions.module.css'

export default function Institutions() {
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

          <div className={styles.grid}>
            {institutions.map((institution) => (
              <Link
                key={institution.id}
                to={`/institutions/${institution.id}`}
                className={styles.card}
              >
                <div className={styles.logoWrapper}>
                  <img src={institution.image} alt={`Logo de ${institution.name}`} className={styles.logo} />
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.campus}>{institution.campus || institution.city}</span>
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
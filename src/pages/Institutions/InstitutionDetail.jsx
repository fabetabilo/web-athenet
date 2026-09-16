import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Building2, Calendar, ChevronLeft, MapPin, Users } from '../../components/ui/icons'
import { institutions } from '../../data/institutions'
import styles from './InstitutionDetail.module.css'

export default function InstitutionDetail() {
  const { id } = useParams()
  const institution = institutions.find((item) => String(item.id) === id)

  if (!institution) {
    return (
      <main className={styles.notFound}>
        <h1>Institución no encontrada</h1>
        <Link to="/institutions">Volver a instituciones</Link>
      </main>
    )
  }

  const stats = [
    { label: 'Equipos', value: `+${institution.teams}`, icon: Users },
    { label: 'Sedes', value: institution.campuses, icon: Building2 },
    { label: 'Eventos', value: institution.events, icon: Calendar },
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
              <img src={institution.image} alt={`Logo de ${institution.name}`} />
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
            <span className={styles.liveDot}>ACTUALIZADO</span>
            <h2>La comunidad deportiva se mueve en {institution.city}.</h2>
            <p>{institution.announcement}</p>
            <Link to="/events" className={styles.actionLink}>Explorar eventos <ArrowRight aria-hidden="true" /></Link>
          </div>
        </article>

        <div className={styles.infoGrid}>
          <article className={styles.infoCard}>
            <span className={styles.cardKicker}>PRÓXIMO EVENTO</span>
            <h2>{institution.nextEvent}</h2>
            <span className={styles.cardMeta}><Calendar aria-hidden="true" /> Calendario Athenet</span>
          </article>
          <article className={styles.infoCard + ' ' + styles.accentCard}>
            <span className={styles.cardKicker}>SEDE PRINCIPAL</span>
            <h2>{institution.campus || institution.city}</h2>
            <span className={styles.cardMeta}><MapPin aria-hidden="true" /> {institution.city}, Chile</span>
          </article>
          <article className={styles.infoCard}>
            <span className={styles.cardKicker}>DISCIPLINAS</span>
            <h2>{institution.disciplines.join(' / ')}</h2>
            <span className={styles.cardMeta}><Users aria-hidden="true" /> Equipos registrados</span>
          </article>
          <article className={styles.infoCard + ' ' + styles.darkCard}>
            <span className={styles.cardKicker}>CONTACTO</span>
            <h2>{institution.contact}</h2>
            <a href={`mailto:${institution.email}`} className={styles.cardMeta}>{institution.email} <ArrowRight aria-hidden="true" /></a>
          </article>
        </div>
      </section>
    </main>
  )
}
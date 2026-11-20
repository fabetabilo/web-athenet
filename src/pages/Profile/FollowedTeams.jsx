import styles from './Profile.module.css'

/** Seccion "Equipos que sigues". */
export default function FollowedTeams() {
  return (
    <div>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Equipos que sigues</h2>
      </div>
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Aún no sigues ningún equipo.</p>
        <p className={styles.hint}>Cuando sigas equipos aparecerán aquí.</p>
      </div>
    </div>
  )
}

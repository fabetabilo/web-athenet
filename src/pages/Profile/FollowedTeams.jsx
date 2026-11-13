import styles from './Profile.module.css'

/** Pestana "Equipos que sigues". */
export default function FollowedTeams() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>Aún no sigues ningún equipo.</p>
      <p className={styles.hint}>Cuando sigas equipos aparecerán aquí.</p>
    </div>
  )
}

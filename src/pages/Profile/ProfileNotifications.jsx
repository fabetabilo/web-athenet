import styles from './Profile.module.css'

/** Seccion "Notificaciones". TODO(backend): al haber endpoint, listar las mismas de `NotificationsBell`. */
export default function ProfileNotifications() {
  return (
    <div>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Notificaciones</h2>
      </div>
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No tienes notificaciones nuevas.</p>
        <p className={styles.hint}>Los avisos de tus equipos y competencias aparecerán aquí.</p>
      </div>
    </div>
  )
}

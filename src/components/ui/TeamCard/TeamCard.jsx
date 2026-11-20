import styles from './TeamCard.module.css'

export default function TeamCard({ team }) {
  return (
    <div className={styles.card}>
      <div className={styles.emblem}>
        {team.logo ? (
          <img src={team.logo} alt="" className={styles.emblemImg} />
        ) : (
          <span className={styles.emblemFallback} aria-hidden="true">{team.acronym}</span>
        )}
      </div>
      <p className={styles.name}>{team.name ?? team.acronym}</p>
    </div>
  )
}

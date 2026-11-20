import Button from '../Button/Button'
import Pill from '../Pill/Pill'
import styles from './CompetitionBanner.module.css'

const STATUS_PILLS = {
  IN_PROGRESS: { label: 'En curso', variant: 'red' },
  SCHEDULED: { label: 'Próxima', variant: 'neutral' },
  FINISHED: { label: 'Finalizada', variant: 'neutral' },
}

/**
 * Card ancha de una competencia (misma estructura que EventCard); el afiche vertical va entero a la derecha.
 *
 * @param {Object} props
 * @param {import('../../../utils/normalizeCompetition').NormalizedCompetition} props.competition
 */
export default function CompetitionBanner({ competition }) {
  const status = STATUS_PILLS[competition.status] ?? STATUS_PILLS.FINISHED

  return (
    <article className={styles.card}>
      {competition.competitionImg && (
        <>
          <div className={styles.backdrop} style={{ backgroundImage: `url(${competition.competitionImg})` }} />
          <img src={competition.competitionImg} alt="" className={styles.poster} />
        </>
      )}

      <div className={styles.content}>
        <div className={styles.top}>
          {competition.sportLabel && <Pill>{competition.sportLabel}</Pill>}
          <Pill variant={status.variant}>{status.label}</Pill>
        </div>

        <h3 className={styles.title}>{competition.name}</h3>
        <p className={styles.date}>{competition.dateLabel}</p>

        <div className={styles.footer}>
          {competition.hasDetail ? (
            <Button
              variant="solid"
              size="md"
              showArrow
              to={`/competitions/${competition.id}`}
              aria-label={`Ver ${competition.name}`}
            >
              Ver competencia
            </Button>
          ) : (
            <Pill size="lg" variant="neutral">Detalle próximamente</Pill>
          )}
        </div>
      </div>
    </article>
  )
}

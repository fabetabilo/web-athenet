import { ChevronLeft, ChevronRight } from '../../icons'
import styles from './CarouselNav.module.css'

export default function CarouselNav({
  onPrev,
  onNext,
  disabled = false,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  variant = 'dark',
  className = '',
}) {
  return (
    <div className={`${styles.navButtons} ${variant === 'light' ? styles.light : ''} ${className}`}>
      <button type="button" className={styles.navBtn} onClick={onPrev} disabled={disabled} aria-label={prevLabel}>
        <ChevronLeft className={styles.navIcon} />
      </button>
      <button type="button" className={styles.navBtn} onClick={onNext} disabled={disabled} aria-label={nextLabel}>
        <ChevronRight className={styles.navIcon} />
      </button>
    </div>
  )
}

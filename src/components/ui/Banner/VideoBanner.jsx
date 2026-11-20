import Button from '../Button/Button'
import styles from './VideoBanner.module.css'

export default function VideoBanner({
  title,
  subtitle,
  cta,
  to,
  href,
  onCtaClick,
  video = `${import.meta.env.BASE_URL}vid/welcome.mp4`,
}) {
  return (
    <section className={styles.banner}>
      <video
        className={styles.video}
        src={video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className={styles.overlayH} />
      <div className={styles.overlayV} />

      <div className={styles.content}>
        <div className={styles.contentInner}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {cta && (
            <Button variant="accent" showArrow to={to} href={to ? undefined : href} onClick={onCtaClick}>
              {cta}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

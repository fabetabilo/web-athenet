import { useRef, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import CarouselNav from './CarouselNav'
import styles from './GalleryCarousel.module.css'

const MAX_PER_VIEW = 4

export default function GalleryCarousel({ images = [], title = 'Galería' }) {
  const count = images.length
  const sets = count > 0 ? 2 * Math.ceil(MAX_PER_VIEW / count) + 1 : 0
  const start = count * Math.floor(sets / 2)

  const [position, setPosition] = useState(start)
  const [animate, setAnimate] = useState(true)
  const [openIndex, setOpenIndex] = useState(null)
  const isMoving = useRef(false)

  if (count === 0) return null

  const rendered = Array.from({ length: sets }, () => images).flat()

  const step = (delta) => {
    if (isMoving.current) return
    isMoving.current = true
    setAnimate(true)
    setPosition((prev) => prev + delta)
  }

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return
    isMoving.current = false
    if (position >= start + count) {
      setAnimate(false)
      setPosition(position - count)
    } else if (position < start) {
      setAnimate(false)
      setPosition(position + count)
    }
  }

  return (
    <section className={styles.gallery}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <CarouselNav
          variant="light"
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          disabled={count < 2}
          prevLabel="Foto anterior"
          nextLabel="Foto siguiente"
        />
      </div>

      <div className={styles.viewport}>
        <div
          className={`${styles.track} ${animate ? '' : styles.noTransition}`}
          style={{ '--position': position }}
          onTransitionEnd={handleTransitionEnd}
        >
          {rendered.map((src, i) => {
            const isReal = i >= start && i < start + count
            return (
              <button
                key={i}
                type="button"
                className={styles.slide}
                onClick={() => setOpenIndex(i % count)}
                onFocus={isReal ? (event) => event.currentTarget.matches(':focus-visible') && setPosition(i) : undefined}
                aria-label={`Ver foto ${(i % count) + 1} de ${count}`}
                aria-hidden={isReal ? undefined : true}
                tabIndex={isReal ? undefined : -1}
              >
                <img src={src} alt="" loading="lazy" className={styles.img} />
              </button>
            )
          })}
        </div>
      </div>

      <Lightbox
        open={openIndex !== null}
        index={openIndex ?? 0}
        close={() => setOpenIndex(null)}
        slides={images.map((src) => ({ src }))}
        controller={{ closeOnBackdropClick: true }}
        styles={{ root: { '--yarl__color_backdrop': 'var(--color-scrim)' } }}
      />
    </section>
  )
}

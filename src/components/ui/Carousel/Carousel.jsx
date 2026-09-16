import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from '../icons'
import styles from './Carousel.module.css'

export default function Carousel({ slides = [] }) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = useCallback(
    (index) => {
      if (transitioning) return
      setTransitioning(true)
      setCurrent(index)
      setTimeout(() => setTransitioning(false), 700)
    },
    [transitioning]
  )

  useEffect(() => {
    if (slides.length === 0) return;
    const id = setInterval(() => goTo((current + 1) % slides.length), 5500)
    return () => clearInterval(id)
  }, [current, goTo, slides.length])

  if (slides.length === 0) return null;

  return (
    <div className={styles.hero}>
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${i === current ? styles.active : ''}`}
        >
          <img src={slide.image} alt={slide.title} className={styles.img} />
          <div className={styles.overlayH} />
          <div className={styles.overlayV} />

          <div className={styles.content}>
            <div className={styles.contentInner}>
              <div className={styles.textBox}>
                <span className={styles.category}>{slide.category}</span>
                <h1 className={styles.title}>{slide.title}</h1>
                <p className={styles.subtitle}>{slide.subtitle}</p>
                <a href="#" className={styles.ctaBtn}>
                  {slide.cta}
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* flecha prev */}
      <button
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        aria-label="Anterior"
      >
        <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
      </button>

      {/* flecha next */}
      <button
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => goTo((current + 1) % slides.length)}
        aria-label="Siguiente"
      >
        <ChevronRight style={{ width: '1rem', height: '1rem' }} />
      </button>

      {/* dots (indicador de slides) */}
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* contador-numero de slides */}
      <div className={styles.counter}>
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  )
}

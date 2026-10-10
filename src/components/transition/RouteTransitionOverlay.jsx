import { useRef } from 'react'
import logo from '../../assets/icon/brand3.png'
import styles from './RouteTransitionOverlay.module.css'

/**
 * La cortina. Capa puramente visual: no decide nada, solo refleja en data-phase
 * la fase que le pasa el provider y avisa cuando su animacion termina.
 *
 * Cambiar el diseno = reescribir este archivo y su .module.css; la maquina de
 * fases no se toca. La secuencia de cada fase vive en el .module.css.
 */
export default function RouteTransitionOverlay({ rootRef, phase, label, onLeadAnimationEnd }) {
  const curtainRef = useRef(null)

  const handleAnimationEnd = (event) => {
    // Tambien burbujea el animationend del logo: solo la cortina manda.
    if (event.target !== curtainRef.current) return
    onLeadAnimationEnd()
  }

  return (
    <>
      <div
        ref={rootRef}
        className={styles.root}
        data-phase={phase}
        aria-hidden="true"
        inert={phase === 'idle' || undefined}
      >
        <div ref={curtainRef} className={styles.curtain} onAnimationEnd={handleAnimationEnd}>
          {/* recorta el logo para que entre y salga por su borde */}
          <div className={styles.logoMask}>
            <img src={logo} alt="" className={styles.logo} />
          </div>
        </div>
      </div>
      <p className={styles.announcer} role="status" aria-live="polite">
        {label ? `Cargando ${label}` : ''}
      </p>
    </>
  )
}

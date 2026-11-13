import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Close } from '../../icons'
import { lockScroll, unlockScroll } from '../../../utils/scrollLock'
import styles from './Modal.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Dialogo modal generico. Se monta en document.body (fuera de #root) para no heredar el
 * `inert` que AppShell aplica durante la transicion de rutas.
 *
 * Cierra con Escape, con el boton X o al hacer clic en el fondo. Atrapa el foco mientras
 * esta abierto y lo devuelve al elemento que lo abrio. El boton X va al final del DOM,
 * asi el primer foco cae en el primer campo del contenido.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.label - Nombre accesible del dialogo.
 * @param {string} [props.className] - Clase extra para el cuerpo del dialogo.
 * @param {React.ReactNode} props.children
 */
export default function Modal({ open, onClose, label, className = '', children }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    const previous = document.activeElement
    const dialog = dialogRef.current
    lockScroll()
    ;(dialog.querySelector(FOCUSABLE) ?? dialog).focus({ preventScroll: true })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      // Foco circular dentro del dialogo
      const items = [...dialog.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockScroll()
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {children}
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          <Close aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  )
}

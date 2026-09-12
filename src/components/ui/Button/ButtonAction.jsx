import styles from './ButtonAction.module.css'

/**
 * ButtonAction
 * Boton especifico para acciones principales como navegar a detalle o similares
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - El componente del ícono a renderizar (ej. ArrowRight)
 * @param {string} [props.className] - Clases adicionales opcionales
 */
export default function ButtonAction({ icon: Icon, className = '', ...props }) {
  return (
    <button className={`${styles.actionBtn} ${className}`} {...props}>
      {Icon && <Icon className={styles.actionIcon} />}
    </button>
  )
}

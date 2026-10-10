import styles from './Pill.module.css'

/**
 * Pill
 * Etiqueta compacta en mayúsculas para categorías y rótulos cortos.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Texto de la etiqueta.
 * @param {string} [props.className] - Clases adicionales para extender estilos.
 */
export default function Pill({ children, className = '', ...props }) {
  return (
    <span className={`${styles.base} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}

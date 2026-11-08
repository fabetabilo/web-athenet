import styles from './Pill.module.css'

// el color y el tamano por defecto viven en .base; las variantes solo sobreescriben
const VARIANTS = { default: '', red: styles.red }
const SIZES = { md: '', lg: styles.lg }

/**
 * Pill
 * Etiqueta compacta en mayúsculas para categorías y rótulos cortos.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Texto de la etiqueta.
 * @param {'default'|'red'} [props.variant='default'] - Color de fondo de la etiqueta.
 * @param {'md'|'lg'} [props.size='md'] - Tamaño de la etiqueta.
 * @param {string} [props.className] - Clases adicionales para extender estilos.
 */
export default function Pill({ children, variant = 'default', size = 'md', className = '', ...props }) {
  const variantClass = VARIANTS[variant] ?? VARIANTS.default
  const sizeClass = SIZES[size] ?? SIZES.md

  return (
    <span className={`${styles.base} ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}

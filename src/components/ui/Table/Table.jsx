import styles from './Table.module.css'

const ALIGNS = {
  left: '',
  center: styles.alignCenter,
  right: styles.alignRight,
}

const VARIANTS = {
  default: '',
  strong: styles.strong,
  muted: styles.muted,
}

/**
 * Componente Table reusable.  
 * 
 * Tabla componible: aporta estructura, estilos y scroll horizontal accesible responsivo.
 * El markup de columnas y celdas lo escribe quien la consume, con TableHead, TableBody, TableRow, TableHeadCell y TableCell.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - thead y tbody de la tabla.
 * @param {string} [props.minWidth='48rem'] - Ancho minimo antes de que aparezca el scroll horizontal.
 * @param {string} [props.label] - Nombre accesible de la tabla y de su region desplazable.
 * @param {string} [props.className] - Clases adicionales para extender estilos.
 */
export default function Table({ children, minWidth = '48rem', label, className = '', ...props }) {
  return (
    // tabIndex en el contenedor: sin el, el scroll horizontal queda fuera del alcance del teclado
    <div className={styles.scroller} role="region" tabIndex={0} aria-label={label}>
      <table
        className={`${styles.table} ${className}`.trim()}
        style={{ '--table-min-width': minWidth }}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

/**
 * Cabecera de la tabla.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function TableHead({ children, className = '', ...props }) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  )
}

/**
 * Cuerpo de la tabla.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

/**
 * Fila de la tabla. Si recibe onClick se vuelve clickeable y alcanzable por
 * teclado: se enfoca con Tab y se activa con Enter o Espacio.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {(event: React.SyntheticEvent) => void} [props.onClick] - Accion de la fila completa.
 * @param {string} [props.className]
 */
export function TableRow({ children, onClick, className = '', ...props }) {
  const isClickable = Boolean(onClick)

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    // Espacio scrollea la pagina por defecto
    event.preventDefault()
    onClick(event)
  }

  return (
    <tr
      className={`${styles.row} ${isClickable ? styles.clickable : ''} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {children}
    </tr>
  )
}

/**
 * Celda de cabecera.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'left'|'center'|'right'} [props.align='left'] - Alineacion horizontal del contenido.
 * @param {string} [props.width] - Ancho de la columna. Solo tiene efecto en la primera fila.
 * @param {string} [props.scope='col']
 * @param {string} [props.className]
 */
export function TableHeadCell({ children, align = 'left', width, scope = 'col', className = '', ...props }) {
  const alignClass = ALIGNS[align] ?? ALIGNS.left

  return (
    <th
      scope={scope}
      className={`${styles.headCell} ${alignClass} ${className}`.trim()}
      style={width ? { width } : undefined}
      {...props}
    >
      {children}
    </th>
  )
}

/**
 * Celda de contenido.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'left'|'center'|'right'} [props.align='left'] - Alineacion horizontal del contenido.
 * @param {'default'|'strong'|'muted'} [props.variant='default'] - Jerarquia del texto.
 *   - 'default': texto oscuro normal.
 *   - 'strong': destacado en negrita.
 *   - 'muted': datos secundarios, en gris.
 * @param {string} [props.className]
 */
export function TableCell({ children, align = 'left', variant = 'default', className = '', ...props }) {
  const alignClass = ALIGNS[align] ?? ALIGNS.left
  const variantClass = VARIANTS[variant] ?? VARIANTS.default

  return (
    <td className={`${styles.cell} ${variantClass} ${alignClass} ${className}`.trim()} {...props}>
      {children}
    </td>
  )
}

import { FILTER_ALL } from './filterUtils'
import styles from './FilterGroup.module.css'

/**
 * Chips de un filtro: opcion "todos" (si hay `allLabel`) mas una por valor. Se oculta si no filtraria
 * nada (menos de dos opciones con "todos"; ninguna sin el).
 *
 * @param {Object} props
 * @param {string} props.label - Rotulo del filtro (tambien su nombre accesible)
 * @param {string} [props.allLabel] - Texto de la opcion que no filtra; sin el, no hay opcion "todos"
 * @param {Array<{ id: string, label: string }>} props.options
 * @param {string} props.value - id seleccionado, o FILTER_ALL (solo con `allLabel`)
 * @param {(id: string) => void} props.onChange
 */
export default function FilterGroup({ label, allLabel, options, value, onChange }) {
  if (options.length < (allLabel ? 2 : 1)) return null

  const items = allLabel ? [{ id: FILTER_ALL, label: allLabel }, ...options] : options
  return (
    <div className={styles.filter} role="group" aria-label={label}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.chips}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={value === item.id}
            className={`${styles.chip} ${value === item.id ? styles.chipActive : ''}`}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
